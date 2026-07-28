import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

const ITEMS_PER_PAGE = 20;
export const fetchSizingInvoices = async (query: string, currentPage: number, startDate: string, endDate: string, billType: string, orderBy: string) => {
  try {
    let lowercaseQuery = query?.toLocaleLowerCase()
    if (orderBy === 'pending') {
      const allInvoice = await prisma.sizing.findMany({
        where: {
          ...(startDate && endDate ? {
            InvoiceDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
            : {}),
          ...(billType ? {
            BillType: billType
          }
            : {}),
          OR: [
            {
              suppliers: {
                is: {
                  // 👈 relation filter
                  Name: { contains: lowercaseQuery }, // 👈 works only if name is String
                }
              },
            },
            {
              suppliers: {
                is: {
                  // 👈 relation filter
                  GstNumber: { contains: query }, // 👈 works only if name is String
                }
              },
            },
            {
              InvoiceNumber: { contains: query }, // invoice string filter
            },
          ],
        },
        include: {
          suppliers: true,
        }
      });

      const data = allInvoice
        .map((inv: any) => ({
          ...inv,
          balance: (inv.InvoiceAmount ?? 0) - (inv.ReceivedAmount ?? 0),
        }))
        .sort((a: any, b: any) => {
          if ((b.balance > 0 ? 0 : 1) !== (a.balance > 0 ? 0 : 1)) {
            return (a.balance > 0 ? 0 : 1) - (b.balance > 0 ? 0 : 1);
          }
          // Then: among pending, order by date desc
          return a.InvoiceDate - b.InvoiceDate;
        });

      const paginated = data.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      );

      return paginated || [];

    } else {
      const data = await prisma.sizing.findMany({
        skip: (currentPage - 1) * ITEMS_PER_PAGE, // skip first page
        take: ITEMS_PER_PAGE,
        orderBy: [
          {
            InvoiceDate: 'desc',
          },
          {
            SizingId: 'desc',
          }
        ],
        where: {
          ...(startDate && endDate ? {
            InvoiceDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
            : {}),
          ...(billType ? {
            BillType: billType,
          }
            : {}),
          OR: [
            {
              suppliers: {
                is: {
                  // 👈 relation filter
                  Name: { contains: lowercaseQuery }, // 👈 works only if name is String
                }
              },
            },
            {
              suppliers: {
                is: {
                  // 👈 relation filter
                  GstNumber: { contains: query }, // 👈 works only if name is String
                }
              },
            },
            {
              InvoiceNumber: { contains: query }, // invoice string filter
            },
          ],
        },
        include: {
          suppliers: true, // joins with customer table
        },
      })

      return data || [];
    }
  } catch (error) {
    return []
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchSizingPages(query: string, startDate: string, endDate: string, billType: string) {
  try {
    let lowercaseQuery = query?.toLocaleLowerCase();
    const data = await prisma.sizing.count({
      where: {
        ...(startDate && endDate ? {
          InvoiceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
          : {}),
        ...(billType ? {
          BillType: billType,
        }
          : {}),
        // BillType: 'normal',
        OR: [
          {
            suppliers: {
              is: {
                // 👈 relation filter
                Name: { contains: lowercaseQuery }, // 👈 works only if name is String
              }
            },
          },
          {
            suppliers: {
              is: {
                // 👈 relation filter
                GstNumber: { contains: query }, // 👈 works only if name is String
              }
            },
          },
          {
            InvoiceNumber: { contains: query }, // invoice string filter
          },
        ],
      },
    });
    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    return {
      count: data,
      totalPages: totalPages
    };
  } catch (error) {
    throw new Error('Failed to fetch total number of sizing.');
  }
}

export const fetchSizingById = async (id: number) => {
  try {
    const data = await prisma.sizing.findMany({
      where: {
        SizingId: id
      },
      include: {
        suppliers: true, // joins with customer table
        sizing_payment_details: true,
        sizing_warp_details: true,
        sizing_yarn_details: true
      },
    })
    return data || [];
  } catch (error) {
    // return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    return [];
  }
}

export const fetchSizingTotal = async (query: string, startDate: string, endDate: string, billType: string, orderBy: string) => {
  try {

    let lowercaseQuery = query?.toLocaleLowerCase()
    const totals = await prisma.sizing.aggregate({
      _sum: {
        InvoiceAmount: true,
        ReceivedAmount: true,
      },
      where: {
        ...(startDate && endDate ? {
          InvoiceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
          : {}),
        ...(billType ? {
          BillType: billType,
        }
          : {}),
        OR: [
          {
            suppliers: {
              is: {
                // 👈 relation filter
                Name: { contains: lowercaseQuery }, // 👈 works only if name is String
              }
            },
          },
          {
            suppliers: {
              is: {
                // 👈 relation filter
                GstNumber: { contains: query }, // 👈 works only if name is String
              }
            },
          },
          {
            InvoiceNumber: { contains: query }, // invoice string filter
          },
        ],
      },
    });

    const totalInvoiceAmount = totals._sum.InvoiceAmount ?? 0;
    const totalReceived = totals._sum.ReceivedAmount ?? 0;
    const balance = totalInvoiceAmount - totalReceived;

    let total = {
      totalInvoiceAmount,
      totalReceived,
      balance
    }

    return total || [];
  } catch (error) {
    return []
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export const fetchSizingBySupplierId = async (customerId: number, startDate: string, endDate: string, billType: string) => {
  try {
    const data = await prisma.invoice.findMany({
      where: {
        ...(startDate && endDate ? {
          InvoiceDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
          : {}),
        ...(billType ? {
          BillType: billType,
        }
          : {}),
        CustomerId: customerId
      },
      orderBy: {
        InvoiceDate: 'asc'
      },
    });
    return data;
  } catch (error) {
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export const fetchPaymentBySupplierId = async (customerId: number, startDate: string, endDate: string, billType: string) => {
  try {
    const payments = await prisma.payment_details.findMany({
      where: {
        invoice: {
          ...(startDate && endDate ? {
            InvoiceDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
            : {}),
          ...(billType !== '' ? {
            BillType: billType,
          }
            : {}),
          customers: {
            CustomerId: customerId
          }
        }
      },
      orderBy: {
        Date: 'asc'
      }
    });
    return payments;
  } catch (error) {
    throw new Error('Failed to fetch total number of yarns.');
  }
}

export const fetchWarps = async (query: string, loomId: string, currentPage: number, loomStatus: string, sizingId: string) => {
  try {
    let lowercaseQuery = query?.toLocaleLowerCase()
    const data = await prisma.sizing_warp_details.findMany({
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: [
        {
          DeliveredDate: 'desc',
        },
      ],
      where: {
        ...(sizingId ?
          { SizingId: Number(sizingId) }
          : {}),
        ...(loomId ? {
          LoomId: Number(loomId)
        }
          : {}),
        ...(loomStatus === 'Loaded' ? {
          StartDate: null
        }
          : {}),
        ...(loomStatus === 'Running' ? {
          StartDate: {
            not: null
          },
          CompletedDate: null
        }
          : {}),
        ...(loomStatus === 'Completed' ? {
          CompletedDate: {
            not: null
          }
        }
          : {}),
      },
      include: {
        warp_dc_details: true,
        sizing: {
          include: {
            suppliers: true, // ✅ nested include via sizing
          },
        },
      },
    })

    // add sum of weight (or any column) to each record
    const withSums = data.map(item => {
      const details = item.warp_dc_details || [];

      const totalDhoties = details.reduce(
        (sum, row) => sum + (row.Count ?? 0),
        0
      );

      // Get last record safely
      const lastRecord = details.length > 0
        ? details[details.length - 1]
        : null;

      const lastDcNumber = lastRecord?.Dc || null;
      const lastDcDate = lastRecord?.Date || null;
      const lastCount = lastRecord?.Count || 0

      return {
        ...item,
        totalDhoties, // 👈 new field added
        lastDcNumber,
        lastDcDate,
        lastCount

      };
    });

    return withSums || [];
  } catch (error) {
    return []
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export const fetchWarpPages = async (query: string, loomId: string, loomStatus: string, sizingId: string) => {
  try {
    const data = await prisma.sizing_warp_details.count({
      where: {
        ...(sizingId ?
          { SizingId: Number(sizingId) }
          : {}),
        ...(loomId ? {
          LoomId: Number(loomId)
        }
          : {}),
        ...(loomStatus === 'Loaded' ? {
          StartDate: null
        }
          : {}),
        ...(loomStatus === 'Running' ? {
          StartDate: {
            not: null
          },
          CompletedDate: null
        }
          : {}),
        ...(loomStatus === 'Completed' ? {
          CompletedDate: {
            not: null
          }
        }
          : {}),
      },
    })
    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    return {
      count: data,
      totalPages: totalPages
    };
  } catch (error) {
    return []
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export const fetchWarpDetails = async (id: number) => {
  try {
    const data = await prisma.sizing_warp_details.findMany({
      where: {
        WarpId: id
      },
      include: {
        sizing: {
          include: {
            suppliers: true, // ✅ nested include via sizing
          },
        },
        warp_dc_details: true
      },
    })
    return data || [];
  } catch (error) {
    // return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    return [];
  }
}

export const fetchWarpsGroupedBySizing = async (loomId: string) => {
  try {
    const data = await prisma.sizing_warp_details.findMany({
      where: {
        LoomId: Number(loomId),
      },
      orderBy: [
        { SizingId: 'desc' },
        { WarpId: 'desc' },
      ],
      include: {
        sizing: {
          include: {
            suppliers: true,
          },
        },
        warp_dc_details: true,
      },
    });

    const grouped = data.reduce((acc: Map<number, any>, item) => {
      const sizingId = item.SizingId ?? 0;
      const group = acc.get(sizingId) ?? {
        sizingId,
        sizing: item.sizing,
        warps: [] as any[],
        totalWeight: 0,
        totalMeters: 0,
      };

      group.warps.push(item);
      group.totalWeight += item.Weight ?? 0;
      group.totalMeters += item.Meters ?? 0;
      acc.set(sizingId, group);
      return acc;
    }, new Map<number, any>());

    return Array.from(grouped.values());
  } catch (error) {
    return [];
  }
}

export const fetchAllSizing = async () => {
  try {
    const data = await prisma.sizing.findMany({
      orderBy: [
        { SizingId: 'desc' },
      ],
      include: {
        _count: {
          select: {
            sizing_warp_details: true,
          },
        },
      }
    })
    return data || [];
  } catch (error) {
    // return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    return [];
  }
}
