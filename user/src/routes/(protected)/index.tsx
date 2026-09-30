import { createFileRoute } from "@tanstack/react-router";
import { PROJECT_NAME } from "../../constants";

export const Route = createFileRoute("/(protected)/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1 className="text-3xl font-bold">{PROJECT_NAME}</h1>
    </div>
  );
}
