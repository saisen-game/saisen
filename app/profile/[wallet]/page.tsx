import { Suspense }         from "react";
import { notFound }         from "next/navigation";
import ProfileClient        from "./ProfileClient";

interface Props {
  params: { wallet: string };
}

export default function ProfilePage({ params }: Props) {
  const wallet = params.wallet;
  // Basic pubkey validation
  if (!wallet || wallet.length < 32 || wallet.length > 44) notFound();

  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#06060f",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Orbitron',monospace", color: "rgba(255,255,255,.3)",
        fontSize: 12, letterSpacing: ".2em",
      }}>
        LOADING…
      </div>
    }>
      <ProfileClient wallet={wallet} />
    </Suspense>
  );
}
