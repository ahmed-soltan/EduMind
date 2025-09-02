import { getUserSession } from "@/utils/get-user-session";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = async (req: Request) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) throw new UploadThingError("Unauthorized");

  return session.user;
};

export const ourFileRouter = {
  // Image uploader
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, fileType: "image" };
    }),

  // PDF uploader
  pdfUploader: f({
    "application/pdf": { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, fileType: "pdf" };
    }),

  // Word uploader
  wordUploader: f({
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    "application/msword": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, fileType: "word" };
    }),

  // PowerPoint uploader
  pptUploader: f({
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    "application/vnd.ms-powerpoint": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, fileType: "ppt" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
