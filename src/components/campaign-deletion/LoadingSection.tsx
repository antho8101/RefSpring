
interface LoadingSectionProps {
  isLoading: boolean;
  message: string;
}

export const LoadingSection = ({ isLoading, message }: LoadingSectionProps) => {
  if (!isLoading) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-blue-800 flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        {message}
      </p>
    </div>
  );
};
