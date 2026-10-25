import Handover from "@/components/Handover";
import HStage from "@/components/HStage";
import Nav from "@/components/Nav";
import Options from "@/components/Options";
import Site from "@/components/Site";
import Stage from "@/components/Stage";
import Why from "@/components/Why";

/* The page: one long scroll story. Its sections arrive in the README's build order. */
export default function Page() {
  return (
    <Site>
      <Handover />
      <Nav />
      <Stage />
      <Why />
      <Options />
      <HStage />
    </Site>
  );
}
