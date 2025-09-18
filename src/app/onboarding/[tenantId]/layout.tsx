interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="h-screen flex items-center justify-center mx-auto">
      {children}
    </div>
  );
}
