type Props = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <div className="text-sm font-medium">{title}</div>
      {description ? <div className="mt-1 text-xs text-muted-foreground">{description}</div> : null}
    </div>
  );
}
