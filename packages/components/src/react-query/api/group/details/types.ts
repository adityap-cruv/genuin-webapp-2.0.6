import type { z } from "zod";

import type { GroupDetailsSchema } from "./schema";

export type GroupDetailsType = z.infer<typeof GroupDetailsSchema>;
