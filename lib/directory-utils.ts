import {
  type ApplicationStatus,
  type Asset,
  type AssetType,
  type Equity,
  type Stage,
  type UserAssetState,
  type StatusDisplay,
  APPLICATION_STATUS_VALUES,
  ASSET_TYPE_VALUES,
  EQUITY_VALUES,
  STAGE_VALUES,
  compareByDeadline,
  getStatusDisplay,
} from "./types";

export type FilterState = {
  query: string;
  assetTypes: AssetType[];
  stages: Stage[];
  equities: Equity[];
  statuses: ApplicationStatus[];
  regions: string[];
};

export type ViewMode = "all" | "saved" | "untracked";

export type ChipOption<T extends string> = {
  label: string;
  value: T;
};

export type QuickFilter = {
  id: string;
  title: string;
  detail: string;
  filters: Partial<FilterState>;
};

export type Playbook = {
  id: string;
  title: string;
  lead: string;
  filters: Partial<FilterState>;
  priorityAssetIds: string[];
};

export type PlaybookSummary = Playbook & {
  assetCount: number;
  featuredAssets: Asset[];
};

export type ApplicationActionSummary = {
  openCount: number;
  upcomingCount: number;
  rollingCount: number;
  nextAssets: {
    asset: Asset;
    status: StatusDisplay;
  }[];
};

export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: "available-now",
    title: "今すぐ動ける",
    detail: "募集中・通年募集",
    filters: { statuses: ["open", "rolling"] },
  },
  {
    id: "non-equity",
    title: "株式を渡さない",
    detail: "非エクイティのみ",
    filters: { equities: ["none"] },
  },
  {
    id: "idea-stage",
    title: "アイデア段階",
    detail: "創業前から使える",
    filters: { stages: ["idea"] },
  },
  {
    id: "cloud-stack",
    title: "開発費を下げる",
    detail: "クラウド/SaaS特典",
    filters: { assetTypes: ["cloud-credit"] },
  },
  {
    id: "global",
    title: "海外へ出る",
    detail: "海外展開・現地支援",
    filters: { assetTypes: ["overseas"] },
  },
  {
    id: "deeptech",
    title: "ディープテック",
    detail: "研究開発・技術実証",
    filters: { query: "ディープテック" },
  },
  {
    id: "women-founders",
    title: "女性起業家",
    detail: "専用プログラム・コミュニティ",
    filters: { query: "女性起業家" },
  },
];

export const PLAYBOOKS: Playbook[] = [
  {
    id: "preseed-starter",
    title: "創業前の初期装備",
    lead: "相談先、無料拠点、非エクイティの育成機会を先に押さえる",
    filters: { stages: ["idea"], equities: ["none"] },
    priorityAssetIds: [
      "tokyo-sogyo-station",
      "startup-hub-tokyo",
      "foundx-fellows",
      "nedo-tcp",
      "tokyo-startup-gateway",
    ],
  },
  {
    id: "deeptech-rd",
    title: "研究開発・ディープテック",
    lead: "技術シーズ、試作、実証、量産化の資金ギャップを埋める",
    filters: { query: "研究開発" },
    priorityAssetIds: [
      "nedo-dtsu",
      "nedo-nep",
      "go-tech",
      "sbir",
      "tech-planter",
    ],
  },
  {
    id: "women-founders",
    title: "女性起業家の成長導線",
    lead: "専用コミュニティ、メンタリング、海外展開支援をまとめて見る",
    filters: { query: "女性起業家" },
    priorityAssetIds: [
      "apt-women",
      "giraffes-japan",
      "led-kansai",
      "shibuya-herrise",
    ],
  },
  {
    id: "global-expansion",
    title: "海外展開・現地接続",
    lead: "海外派遣、現地拠点、グローバルアクセラを比較する",
    filters: { assetTypes: ["overseas"] },
    priorityAssetIds: [
      "j-starx",
      "jetro-gsap",
      "x-hub-tokyo",
      "japan-innovation-campus",
      "y-combinator",
    ],
  },
  {
    id: "infra-credits",
    title: "開発費・SaaSコスト削減",
    lead: "クラウド、開発、分析、CRMの初期費用を下げる",
    filters: { assetTypes: ["cloud-credit"] },
    priorityAssetIds: [
      "ms-startups",
      "google-cloud-startups",
      "aws-activate",
      "github-startups",
      "posthog-startups",
    ],
  },
  {
    id: "public-non-dilutive",
    title: "株式を渡さない公的資金",
    lead: "補助金、助成金、融資、自治体支援を非エクイティで探す",
    filters: {
      assetTypes: ["grant-subsidy", "funding"],
      equities: ["none"],
    },
    priorityAssetIds: [
      "tokyo-sogyo-grant",
      "jfc-startup-loan",
      "shinjigyou-shinshutsu",
      "jizokuka-sogyo",
      "smrj-fastar",
    ],
  },
];

const REGION_PRIORITY = [
  "全国",
  "東京",
  "北海道",
  "東北",
  "神奈川",
  "大阪",
  "関西",
  "近畿",
  "京都",
  "兵庫",
  "神戸",
  "東海",
  "愛知",
  "福岡",
  "九州",
  "中国",
  "四国",
  "海外",
  "グローバル",
  "米国",
  "欧州",
] as const;

export function createEmptyFilters(): FilterState {
  return {
    query: "",
    assetTypes: [],
    stages: [],
    equities: [],
    statuses: [],
    regions: [],
  };
}

export function applyQuickFilter(
  current: FilterState,
  quickFilter: QuickFilter,
): FilterState {
  return {
    ...createEmptyFilters(),
    ...quickFilter.filters,
    query: quickFilter.filters.query ?? current.query,
  };
}

export function applyPlaybook(
  current: FilterState,
  playbook: Playbook,
): FilterState {
  return {
    ...createEmptyFilters(),
    ...playbook.filters,
    query: playbook.filters.query ?? current.query,
  };
}

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  appendParam(params, "type", filters.assetTypes);
  appendParam(params, "stage", filters.stages);
  appendParam(params, "equity", filters.equities);
  appendParam(params, "status", filters.statuses);
  appendParam(params, "region", filters.regions);
  return params;
}

export function filtersFromSearchParams(params: SearchParamReader): FilterState {
  return {
    query: (params.get("q") ?? "").trim(),
    assetTypes: readEnumParam(params, "type", ASSET_TYPE_VALUES),
    stages: readEnumParam(params, "stage", STAGE_VALUES),
    equities: readEnumParam(params, "equity", EQUITY_VALUES),
    statuses: readEnumParam(params, "status", APPLICATION_STATUS_VALUES),
    regions: readTextParam(params, "region"),
  };
}

export function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function getActiveCount(filters: FilterState): number {
  return (
    filters.assetTypes.length +
    filters.stages.length +
    filters.equities.length +
    filters.statuses.length +
    filters.regions.length +
    (filters.query.trim() ? 1 : 0)
  );
}

export function getFilteredAssets(
  assets: Asset[],
  filters: FilterState,
): Asset[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return assets
    .filter((asset) => matchesQuery(asset, normalizedQuery))
    .filter((asset) => matchesAssetTypes(asset, filters.assetTypes))
    .filter((asset) => matchesStages(asset, filters.stages))
    .filter((asset) => matchesEquities(asset, filters.equities))
    .filter((asset) => matchesStatuses(asset, filters.statuses))
    .filter((asset) => matchesRegions(asset, filters.regions))
    .toSorted(compareByDeadline);
}

export function getVisibleAssets({
  assets,
  filters,
  stateByAssetId,
  viewMode,
}: {
  assets: Asset[];
  filters: FilterState;
  stateByAssetId: Record<string, UserAssetState>;
  viewMode: ViewMode;
}): Asset[] {
  return getFilteredAssets(assets, filters).filter((asset) =>
    matchesViewMode(asset, stateByAssetId, viewMode),
  );
}

export function getRegionOptions(assets: Asset[]): ChipOption<string>[] {
  const seen = new Set<string>();
  for (const asset of assets) {
    for (const region of getAssetRegions(asset)) seen.add(region);
  }
  return [...seen].sort(compareRegions).map((region) => ({
    label: region,
    value: region,
  }));
}

export function getPlaybookSummaries(assets: Asset[]): PlaybookSummary[] {
  return PLAYBOOKS.map((playbook) => {
    const matchedAssets = getFilteredAssets(assets, {
      ...createEmptyFilters(),
      ...playbook.filters,
    });
    return {
      ...playbook,
      assetCount: matchedAssets.length,
      featuredAssets: getFeaturedAssets(matchedAssets, playbook),
    };
  });
}

export function getApplicationActionSummary(
  assets: Asset[],
  now?: Date,
): ApplicationActionSummary {
  const openCount = countByStatus(assets, "open");
  const upcomingCount = countByStatus(assets, "upcoming");
  const rollingCount = countByStatus(assets, "rolling");
  const nextAssets = assets
    .filter((asset) =>
      ["open", "upcoming"].includes(asset.application.status),
    )
    .toSorted(compareByDeadline)
    .slice(0, 3)
    .map((asset) => ({
      asset,
      status: getStatusDisplay(asset.application, now),
    }));
  return { openCount, upcomingCount, rollingCount, nextAssets };
}

function getFeaturedAssets(assets: Asset[], playbook: Playbook): Asset[] {
  const rankById = new Map(
    playbook.priorityAssetIds.map((assetId, index) => [assetId, index]),
  );
  return assets
    .toSorted((a, b) => {
      const ar = rankById.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const br = rankById.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ar === br ? compareByDeadline(a, b) : ar - br;
    })
    .slice(0, 3);
}

function countByStatus(assets: Asset[], status: ApplicationStatus): number {
  return assets.filter((asset) => asset.application.status === status).length;
}

type SearchParamReader = {
  get: (name: string) => string | null;
  getAll: (name: string) => string[];
};

function appendParam(
  params: URLSearchParams,
  name: string,
  values: readonly string[],
): void {
  if (values.length > 0) params.set(name, values.join(","));
}

function readEnumParam<T extends string>(
  params: SearchParamReader,
  name: string,
  allowed: readonly T[],
): T[] {
  const allowedSet = new Set<string>(allowed);
  return readTextParam(params, name).filter((value): value is T =>
    allowedSet.has(value),
  );
}

function readTextParam(params: SearchParamReader, name: string): string[] {
  return [
    ...new Set(
      params
        .getAll(name)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

function matchesViewMode(
  asset: Asset,
  stateByAssetId: Record<string, UserAssetState>,
  viewMode: ViewMode,
): boolean {
  if (viewMode === "all") return true;
  const tracked = Boolean(stateByAssetId[asset.id]);
  return viewMode === "saved" ? tracked : !tracked;
}

function matchesQuery(asset: Asset, query: string): boolean {
  if (!query) return true;
  return getSearchText(asset).includes(query);
}

function getSearchText(asset: Asset): string {
  const status = getStatusDisplay(asset.application);
  return [
    asset.name,
    asset.nameEn ?? "",
    asset.operator,
    asset.region ?? "",
    asset.summary,
    asset.value ?? "",
    asset.eligibility ?? "",
    status.label,
    status.detail,
    asset.screening?.fit.summary ?? "",
    ...(asset.screening?.fit.founderTypes ?? []),
    ...(asset.screening?.fit.sectors ?? []),
    asset.screening?.benefit.summary ?? "",
    ...(asset.screening?.effort.requiredDocuments ?? []),
    ...(asset.screening?.risk.notes ?? []),
    ...(asset.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesAssetTypes(asset: Asset, selected: AssetType[]): boolean {
  return selected.length === 0
    ? true
    : asset.assetTypes.some((type) => selected.includes(type));
}

function matchesStages(asset: Asset, selected: Stage[]): boolean {
  return selected.length === 0
    ? true
    : asset.stages.some((stage) => selected.includes(stage) || stage === "any");
}

function matchesEquities(asset: Asset, selected: Equity[]): boolean {
  return selected.length === 0 ? true : selected.includes(asset.equity);
}

function matchesStatuses(asset: Asset, selected: ApplicationStatus[]): boolean {
  return selected.length === 0
    ? true
    : selected.includes(asset.application.status);
}

function matchesRegions(asset: Asset, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const regions = getAssetRegions(asset);
  return selected.some((region) => regions.includes(region));
}

function getAssetRegions(asset: Asset): string[] {
  if (!asset.region) return [];
  const compact = asset.region.replace(/[（(].*?[）)]/g, "");
  const source = compact.split(/[→/／・,、]/).map((item) => item.trim());
  return [...new Set(source.flatMap(toRegionFacets).filter(Boolean))];
}

function toRegionFacets(label: string): string[] {
  const matched = REGION_PRIORITY.filter((region) => label.includes(region));
  return matched.length > 0 ? [...matched] : [label];
}

function compareRegions(a: string, b: string): number {
  const ai = REGION_PRIORITY.indexOf(a as (typeof REGION_PRIORITY)[number]);
  const bi = REGION_PRIORITY.indexOf(b as (typeof REGION_PRIORITY)[number]);
  if (ai !== -1 || bi !== -1) return rankRegion(ai) - rankRegion(bi);
  return a.localeCompare(b, "ja");
}

function rankRegion(index: number): number {
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
