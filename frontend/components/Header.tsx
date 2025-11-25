export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex flex-col pl-4">
          <h1 className="text-2xl font-bold">Nefarm AI</h1>
          <p className="text-sm text-muted-foreground">Pesquisa e extração de dados</p>
        </div>
      </div>
    </header>
  );
};
