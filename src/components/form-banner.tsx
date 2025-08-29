import { AlertTriangle } from "lucide-react";

interface FormBanner {
  message: string;
}

export const FormBanner = ({ message }: FormBanner) => {
  return (
    <div className="w-full border-red-400 border rounded-md bg-red-200 p-3 my-2">
      <p className="text-sm text-red-800 flex items-center gap-1">
        <AlertTriangle className="size-4" />
        {message}
      </p>
    </div>
  );
};
