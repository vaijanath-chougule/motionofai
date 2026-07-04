import MagneticButton from '../components/common/MagneticButton';

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center text-center">
      <div className="shell">
        <p className="eyebrow mb-6">404</p>
        <h1 className="text-display-md font-semibold text-ink">
          This page took a <span className="text-accent">detour</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted">
          Let's get you back to the story.
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticButton to="/" variant="primary">
            Back to Home
          </MagneticButton>
        </div>
      </div>
    </main>
  );
}
