import { useMutation } from "@tanstack/react-query";

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (data: { documentId: string; message: string }) => {
      const response = await fetch("/api/documents/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
  });
};
