import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: App,
});

function App() {
    return (
        <div>
            <ul>
                <li>
                    <Link to="/auth/register/business/">register</Link>
                </li>
                <li>
                    <Link to="/panel">panel</Link>
                </li>
                <li>
                    <Link to="/home">home</Link>
                </li>
            </ul>
        </div>
    );
}
