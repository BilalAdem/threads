import { generateReactHelpers } from "@uploadthing/react/hooks";
 
import type { OurFileRouter } from "@/app/api/uploadthing/corse";
 
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();