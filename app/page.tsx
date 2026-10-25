import Nav from "@/components/Nav";
import Site from "@/components/Site";
import Stage from "@/components/Stage";

/* The page: one long scroll story. Its sections arrive in the README's build order. */
export default function Page() {
  return (
    <Site>
      <Nav />
      <Stage />
    </Site>
  );
}
