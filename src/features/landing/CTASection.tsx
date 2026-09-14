"use client";

import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { signOut } from "@/features/auth/demo-auth";
import { AuthForm } from "@/features/auth/AuthDialog";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/features/auth/useSession";

/**
 * Final conversion step: the registration form itself, on the page rather than
 * behind a modal, so the primary action is never more than a scroll away.
 *
 * Once someone is registered the same panel becomes their account summary —
 * the section keeps its place in the page instead of vanishing and leaving a
 * hole in the scroll.
 */
export function CTASection() {
  const session = useSession();

  return (
    <section id="waitlist">
      <div className="wrap">
        <div className="section-head section-head--center">
          <span className="section-tag">Early access</span>
          <h2>{session ? "You are on the list" : "Create your account"}</h2>
          <p>
            {session
              ? "We will email you the moment matching opens in your area. Nothing else to do for now."
              : "Free during early access. Register now and we will match you as soon as we launch where you live."}
          </p>
        </div>

        <Reveal className="auth-panel">
          {session ? (
            <div className="account-summary" role="status">
              <span className="account-summary__avatar">
                {session.avatar ? (
                  <Image src={session.avatar} alt="" width={56} height={56} />
                ) : (
                  <span aria-hidden="true">{session.name.charAt(0).toUpperCase()}</span>
                )}
              </span>

              <h3>Welcome, {session.name.split(" ")[0]}.</h3>
              <p className="account-summary__email">{session.email}</p>

              <dl className="account-summary__facts">
                <div>
                  <dt>Account type</dt>
                  <dd>
                    {session.role === "customer" ? "Customer" : "Tradesperson"}
                  </dd>
                </div>
                <div>
                  <dt>Signed in with</dt>
                  <dd>{session.provider === "google" ? "Google" : "Email"}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <Icon name="clock" className="account-summary__icon" />
                    Waiting for launch
                  </dd>
                </div>
              </dl>

              <button className="btn btn-outline" type="button" onClick={signOut}>
                Sign out
              </button>

              <p className="auth-note">
                Demo only. This account lives in this browser and is cleared when you clear
                site data.
              </p>
            </div>
          ) : (
            <AuthForm initialMode="register" compact />
          )}
        </Reveal>
      </div>
    </section>
  );
}
