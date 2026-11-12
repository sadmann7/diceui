import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { ratelimit } from "@/lib/rate-limit";

const f = createUploadthing();

async function auth(_req: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { id: "fakeId" };
}

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 8 } })
    .middleware(async ({ req }) => {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

      const { success } = await ratelimit.limit(ip);

      if (!success) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError("Rate limit exceeded");
      }

      const user = await auth(req);

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
