export default function layout({ children }) {
  return (
    <div className="container m-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center">
      {children}
    </div>
  );
}
