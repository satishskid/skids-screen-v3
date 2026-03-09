/**
 * Geographic Drill-Down — Hierarchical location-based analytics.
 * Country → State → District → City → School drill-down with condition prevalence per level.
 */

import { useState, useMemo } from 'react'
import { ChevronRight, MapPin, ChevronDown } from 'lucide-react'
import type { CampaignDataBundle, GeoNode } from '@skids/shared'
import { buildGeoHierarchy } from '@skids/shared'

interface GeographicDrillDownProps {
  bundles: CampaignDataBundle[]
}

export function GeographicDrillDown({ bundles }: GeographicDrillDownProps) {
  const geoTree = useMemo(() => buildGeoHierarchy(bundles), [bundles])

  if (!geoTree || geoTree.children.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Geographic Analysis</h3>
        <p className="mt-3 text-sm text-gray-400 text-center py-8">
          No location data available. Add locations to campaigns for geographic drill-down.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Geographic Drill-Down</h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Click to expand regions. {geoTree.totalChildren} total children across {geoTree.campaignCodes.length} campaigns.
      </p>
      <div className="mt-4">
        <GeoNodeRow node={geoTree} depth={0} />
      </div>
    </div>
  )
}

function GeoNodeRow({ node, depth }: { node: GeoNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = node.children.length > 0
  const coveragePct = node.totalChildren > 0
    ? Math.round((node.screenedChildren / node.totalChildren) * 100)
    : 0

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        onClick={() => hasChildren && setExpanded(e => !e)}
        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
          hasChildren ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
        }`}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          )
        ) : (
          <div className="w-3.5" />
        )}

        <span className={`text-sm font-medium ${depth === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
          {node.label}
        </span>
        <span className="text-[10px] text-gray-400 capitalize">{node.level}</span>

        <div className="ml-auto flex items-center gap-3">
          {/* Coverage bar */}
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${coveragePct}%` }} />
            </div>
            <span className="text-[10px] text-gray-400 w-8 text-right">{coveragePct}%</span>
          </div>

          <span className="text-xs text-gray-500 w-12 text-right">{node.screenedChildren} children</span>

          {/* Risk distribution mini-bar */}
          {node.riskDistribution && (
            <div className="flex h-2 w-16 overflow-hidden rounded-full">
              {node.riskDistribution.noRisk > 0 && (
                <div
                  className="bg-green-400"
                  style={{ width: `${(node.riskDistribution.noRisk / (node.riskDistribution.noRisk + node.riskDistribution.possibleRisk + node.riskDistribution.highRisk || 1)) * 100}%` }}
                />
              )}
              {node.riskDistribution.possibleRisk > 0 && (
                <div
                  className="bg-amber-400"
                  style={{ width: `${(node.riskDistribution.possibleRisk / (node.riskDistribution.noRisk + node.riskDistribution.possibleRisk + node.riskDistribution.highRisk || 1)) * 100}%` }}
                />
              )}
              {node.riskDistribution.highRisk > 0 && (
                <div
                  className="bg-red-400"
                  style={{ width: `${(node.riskDistribution.highRisk / (node.riskDistribution.noRisk + node.riskDistribution.possibleRisk + node.riskDistribution.highRisk || 1)) * 100}%` }}
                />
              )}
            </div>
          )}

          <span className="text-[10px] text-gray-400 w-10 text-right">
            {node.referralRate.toFixed(0)}% ref
          </span>
        </div>
      </button>

      {/* Top conditions inline */}
      {expanded && node.topConditions.length > 0 && depth > 0 && (
        <div className="flex flex-wrap gap-1 px-3 py-1" style={{ paddingLeft: 16 + depth * 16 }}>
          {node.topConditions.slice(0, 5).map(cond => (
            <span key={cond.conditionId} className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
              {cond.conditionName}: {cond.count}
            </span>
          ))}
        </div>
      )}

      {/* Children nodes */}
      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <GeoNodeRow key={`${child.level}-${child.label}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
