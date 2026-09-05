import { useState } from "react";
import type { UpdateStatus } from "../lib/updates";
import { updateBannerText } from "../lib/updates";

type Props = {
  status: UpdateStatus;
  onInstall: () => void;
  onSaveToken: (token: string) => void;
};

export function UpdateBanner({ status, onInstall, onSaveToken }: Props) {
  const [token, setToken] = useState("");

  return (
    <div className={`update-banner ${status.state}`}>
      <span>{updateBannerText(status)}</span>
      {status.state === "ready" ? (
        <button type="button" onClick={onInstall}>
          Restart
        </button>
      ) : null}
      {status.state === "needsToken" ? (
        <form
          className="update-token"
          onSubmit={(event) => {
            event.preventDefault();
            const next = token.trim();
            if (next) onSaveToken(next);
          }}
        >
          <input
            type="password"
            value={token}
            autoComplete="off"
            placeholder="ghp_… read-only token"
            onChange={(event) => setToken(event.target.value)}
          />
          <button type="submit" disabled={!token.trim()}>
            Save
          </button>
        </form>
      ) : null}
    </div>
  );
}
