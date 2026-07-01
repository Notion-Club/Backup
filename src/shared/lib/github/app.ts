import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

// GitHub App — helpers serveur (réutilisés par le runner M2d).
// La clé privée de l'App est un secret GLOBAL en env (pas par-destination) :
// on mint un token d'installation (~1h, mis en cache par l'instance Octokit).

function appId(): number {
  const v = Number(process.env.GITHUB_APP_ID);
  if (!Number.isFinite(v)) throw new Error("GITHUB_APP_ID manquant ou invalide.");
  return v;
}

function privateKey(): string {
  const v = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!v) throw new Error("GITHUB_APP_PRIVATE_KEY manquant.");
  // Les clés PEM en variable d'env ont souvent des \n littéraux.
  return v.includes("\\n") ? v.replace(/\\n/g, "\n") : v;
}

export function githubAppSlug(): string {
  const v = process.env.GITHUB_APP_SLUG;
  if (!v) throw new Error("GITHUB_APP_SLUG manquant.");
  return v;
}

// Cache des instances Octokit par installation : chacune gère en interne le
// token d'installation (création transparente + refresh à expiration).
const octokitCache = new Map<number, Octokit>();

export function getInstallationOctokit(installationId: number): Octokit {
  const cached = octokitCache.get(installationId);
  if (cached) return cached;

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: { appId: appId(), privateKey: privateKey(), installationId },
  });
  octokitCache.set(installationId, octokit);
  return octokit;
}

export interface InstallationRepo {
  full_name: string;
  default_branch: string;
}

// Liste les repos accessibles à une installation (100 premiers).
export async function listInstallationRepos(
  installationId: number,
): Promise<InstallationRepo[]> {
  const octokit = getInstallationOctokit(installationId);
  const res = await octokit.request("GET /installation/repositories", {
    per_page: 100,
  });
  return res.data.repositories.map((r) => ({
    full_name: r.full_name,
    default_branch: r.default_branch,
  }));
}

// Lien d'installation de la GitHub App (+ state signé lié à la session).
export function buildInstallUrl(state: string): string {
  return `https://github.com/apps/${githubAppSlug()}/installations/new?state=${encodeURIComponent(state)}`;
}
