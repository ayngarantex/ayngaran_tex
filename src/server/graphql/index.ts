import { dashboardSchema } from './schemas/dashboardSchema';
import { productSchema } from './schemas/productSchema';
import { invoiceSchema } from './schemas/invoiceSchema';
import { customerSchema } from './schemas/customerSchema';
import { warpSchema } from './schemas/warpSchema';
import { supplierSchema } from './schemas/supplierSchema';
import { sizingSchema } from './schemas/sizingSchema';
import { yarnSchema } from './schemas/yarnSchema';
import { loomSchema } from './schemas/loomSchema';
import { paymentSchema } from './schemas/paymentSchema';
import { stockSchema } from './schemas/stockSchema';

import { dashboardResolver } from './resolvers/dashboardResolver';
import { productResolver } from './resolvers/productResolver';
import { invoiceResolver } from './resolvers/invoiceResolver';
import { customerResolver } from './resolvers/customerResolver';
import { warpResolver } from './resolvers/warpResolver';
import { supplierResolver } from './resolvers/supplierResolver';
import { sizingResolver } from './resolvers/sizingResolver';
import { yarnResolver } from './resolvers/yarnResolver';
import { loomResolver } from './resolvers/loomResolver';
import { paymentResolver } from './resolvers/paymentResolver';
import { stockResolver } from './resolvers/stockResolver';

export const typeDefs = [
    dashboardSchema,
    productSchema,
    invoiceSchema,
    customerSchema,
    warpSchema,
    supplierSchema,
    sizingSchema,
    yarnSchema,
    loomSchema,
    paymentSchema,
    stockSchema,
];

export const resolvers = [
    dashboardResolver,
    productResolver,
    invoiceResolver,
    customerResolver,
    warpResolver,
    supplierResolver,
    sizingResolver,
    yarnResolver,
    loomResolver,
    paymentResolver,
    stockResolver,
];
