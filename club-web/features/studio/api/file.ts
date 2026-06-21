import { apiFetch } from "@/lib/api-types";

export interface UploadFileResponse {
  url: string;
  filename: string;
}

export const uploadFile = async (
  token: string,
  file: File,
  filename: string,
  destPath: string,
): Promise<UploadFileResponse> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("filename", filename);
  formData.append("dest_path", destPath);

  const response = await apiFetch<UploadFileResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/file/upload`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  return response.data;
};
