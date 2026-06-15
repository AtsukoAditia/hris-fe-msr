export default function SmokeComponent({ name = 'HRIS' }) {
  return (
    <section aria-label="smoke-test">
      <h1>{name} Frontend</h1>
      <button type="button">Continue</button>
    </section>
  )
}
