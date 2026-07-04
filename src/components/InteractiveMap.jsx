import { useState } from "react"
import { Skull, Users, ScrollText, Landmark, Lock } from "lucide-react"
import { ravenfallDistricts } from "../data/ravenfallDistricts"
import campaign from "../data/campaign.json"

export default function InteractiveMap() {

  const getLocationState = (districtId) => {
    return campaign.locations?.find(
      (location) => location.id === districtId
    )
  }

  const discoveredDistricts = ravenfallDistricts.filter((district) => {
    const state = getLocationState(district.id)
    return state?.discovered
  })

  const [selected, setSelected] = useState(
    discoveredDistricts.length > 0
      ? {
          ...discoveredDistricts[0],
          state: getLocationState(discoveredDistricts[0].id),
        }
      : null
  )

  return (
    <div className="interactiveMapLayout">
      <div className="interactiveMapFrame">
        <img
          src="/assets/ravenfall-map.png"
          alt="Mappa interattiva di Ravenfall"
          className="interactiveMapImage"
        />

        {ravenfallDistricts.map((district) => {
          const state = getLocationState(district.id)

          const discovered = state?.discovered ?? false
          const discoveryOrder = state?.discovery_order ?? null

          return (
            <button
              key={district.id}
              className={`districtHotspot ${district.type} ${
                selected?.id === district.id ? "active" : ""
              } ${!discovered ? "locked" : ""}`}
              style={{
                left: `${district.x}%`,
                top: `${district.y}%`,
              }}
              onClick={() =>
                discovered &&
                setSelected({
                  ...district,
                  state,
                })
              }
              title={
                discovered
                  ? district.name
                  : "Luogo non ancora scoperto"
              }
              disabled={!discovered}
            >
              {discovered ? discoveryOrder : "?"}
            </button>
          )
        })}
      </div>

      <aside className="districtPanel ornament">
        {selected ? (
          <>
            <p className="eyebrow tiny">Luogo scoperto</p>

            <h3>{selected.name}</h3>

            <p>{selected.description}</p>

            {selected.state?.last_visit && (
              <p className="tiny">
                Ultima visita: {selected.state.last_visit}
              </p>
            )}

            <div className="districtMeta">
              <span>
                <Skull size={15} /> {selected.faction}
              </span>
            </div>

            <PanelList
              icon={<Landmark size={16} />}
              title="Luoghi"
              items={selected.locations}
            />

            <PanelList
              icon={<Users size={16} />}
              title="PNG"
              items={selected.npcs}
            />

            <PanelList
              icon={<ScrollText size={16} />}
              title="Misteri"
              items={selected.mysteries}
            />
          </>
        ) : (
          <EmptyMapPanel />
        )}
      </aside>
    </div>
  )
}

function EmptyMapPanel() {
  return (
    <>
      <p className="eyebrow tiny">Mappa di Ravenfall</p>

      <h3>Archivio dei luoghi</h3>

      <p>
        I luoghi vengono rivelati man mano che Ethan li scopre
        nel corso della campagna.
      </p>

      <div className="districtMeta">
        <span>
          <Lock size={15} /> Alcune aree sono ancora sconosciute
        </span>
      </div>
    </>
  )
}

function PanelList({ icon, title, items = [] }) {
  if (!items.length) return null

  return (
    <div className="panelList">
      <h4>
        {icon}
        {title}
      </h4>

      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}