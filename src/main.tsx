import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getLocale } from "#/paraglide/runtime";
import { router } from "#/router";
import "./styles.css";

// setLocale reloads the page, so the document's language is decided once here.
document.documentElement.lang = getLocale();

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

createRoot(root).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
