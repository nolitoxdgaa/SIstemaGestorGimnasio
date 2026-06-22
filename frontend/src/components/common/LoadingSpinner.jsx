export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const cls = size === 'lg' ? 'spinner spinner-lg' : 'spinner';

  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className={cls} style={{ width: 48, height: 48, borderWidth: 3 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-center">
      <div className={cls} />
    </div>
  );
}
