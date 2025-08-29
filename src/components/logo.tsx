import { Brain } from "lucide-react";

interface LogoProps {
  size?: number;
  fontSize?: number;
}

export const Logo = ({ size = 35, fontSize = 2 }: LogoProps) => {
  return (
    <div className="flex items-center gap-1">
      <div
        style={{ width: size, height: size }}
        className="bg-blue-600 rounded-lg flex items-center justify-center shadow-glow"
      >
        <Brain
          style={{ width: size - 1, height: size - 1 }}
          className="text-white"
        />
      </div>
      <span style={{ fontSize: `${fontSize}rem` }} className="font-bold">
        Edu<span className="text-blue-500">Mind</span>
      </span>
    </div>
  );
};
