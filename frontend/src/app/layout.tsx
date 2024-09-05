import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavRail from "@/components/ui/NavRail";
import { UserProvider } from "@/context/userContext";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<UserProvider>
					<div className="flex">
						<NavRail />
						<main className="ml-20 w-full h-full">
							<AuthGuard>{children}</AuthGuard>
						</main>
					</div>
				</UserProvider>
			</body>
		</html>
	);
}
