export default function Header({ title }: { title: string }) {
    return (
      <div className="header">
        <h1 className="header-title">{title}</h1>
      </div>
    )
  }
  