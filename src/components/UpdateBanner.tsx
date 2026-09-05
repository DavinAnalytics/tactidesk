import type { UpdateStatus } from "../lib/updates";
import { updateBannerText } from "../lib/updates";

type Props = {
  status: UpdateStatus;
  onInstall: () => void;
};

export function UpdateBanner({ status, onInstall }: Props) {
  return (
    <div className={`update-banner ${status.state}`}>
      <span>{updateBannerText(status)}</span>
      {status.state === "ready" ? (
        <button type="button" onClick={onInstall}>
          Restart
        </button>
      ) : null}
    </div>
  );
}
