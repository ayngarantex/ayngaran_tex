// "use client";

// import { useEffect, useState } from "react";
// import InvoicesTable from "@/app/ui/invoices/table";
// import { getFinancialYears } from "@/app/lib/utils";

// export default function TableWrapper() {
//   const [query, setQuery] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [invoices, setInvoices] = useState<any>([]);
//   const [currentPage, setCurrentPage] = useState(1);

//   // useEffect(() => {

//   //   async function loadData() {
//   //     const jsonBody = JSON.stringify({
//   //       query: query,
//   //       currentPage: currentPage,
//   //       startDate: startDate,
//   //       endDate: endDate
//   //     })

//   //     const res = await fetch('/api/invoices', {
//   //       method: 'GET',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: jsonBody,
//   //     });

//   //     setInvoices(res);
//   //   }
//   //   loadData();
//   // }, [query, startDate, endDate, currentPage]);

//   return (
//     <div>
//       <div className="flex items-center gap-4 mb-4">
//         <div className="w-1/6">
//           <input
//             type="text"
//             placeholder={'Search Invoice'}
//             className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
//             onChange={(e) => setQuery(e.target.value)}
//           />
//         </div>
//         <div className="w-1/6">
//           <div className="relative">
//               <select
//                   id="financialYear"
//                   name="financialYear"
//                   onChange={(e) => {
//                       let startDate = '';
//                       let endDate = '';
//                       if(e.target.value !== "select") {
//                           const [start, end] = e.target.value.split("-").map(String);
//                           startDate = `${start}-04-01` ;
//                           endDate = `${end}-03-31`;
//                       }
//                       setStartDate(startDate);
//                       setEndDate(endDate);
//                   }}
//                   className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
//                   // value={financialYear}
//               >
//                   <option key={'select'} value={'select'}> Select a Financial Year </option>
//                   {getFinancialYears(2022).map((year: string) => (
//                       <option
//                           key={year}
//                           value={year}
//                       >
//                           {year}
//                       </option>
//                   ))}
//               </select>
//           </div>
//         </div>
//         {/* <div className="w-1/6">
//           <div className="relative">
//             <select
//               id="financialYear"
//               name="financialYear"
//               onChange={(e) => {
//                   let startDate = '';
//                   let endDate = '';
//                   if(e.target.value !== "select") {
//                       const [start, end] = e.target.value.split("-").map(String);
//                       startDate = `${start}-04-01` ;
//                       endDate = `${end}-03-31`;
//                   }
//                   // setStartDate(startDate);
//                   // setEndDate(endDate);
//               }}
//               className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-5 text-sm outline-2 placeholder:text-gray-500"
//               // value={financialYear}
//             >
//               <option key={'select'} value={'select'}> Select a Financial Year </option>
//               {getFinancialYears(2022).map((year: string) => (
//                 <option
//                   key={year}
//                   value={year}
//                 >
//                   {year}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div> */}
//       </div>

//       <InvoicesTable
//         query={query}
//         currentPage={currentPage}
//         startDate={startDate}
//         endDate={endDate}
//         />
//     </div>
//   );
// }