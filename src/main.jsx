import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BookOpen, Castle, Eye, Map, Moon, ScrollText, Shield, Sparkles, Users, Feather, Skull, ChevronRight } from 'lucide-react'
import campaign from './data/campaign.json'
import InteractiveMap from "./components/InteractiveMap";
import './styles.css'
import dagre from 'dagre'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const nav = [
  ['home', 'Home'],
  ['ravenfall', 'Ravenfall'],
  ['campagna', 'Campagna'],
  ['cronache', 'Cronache'],
  ['personaggi', 'Personaggi'],
  ['misteri', 'Misteri'],  
  ['regole', 'Regole']
]

const chapterModules = import.meta.glob('./content/chronicles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

const chapters = Object.entries(chapterModules)
  .map(([path, content]) => {
    const fileName = path.split('/').pop().replace('.md', '')
    const [number, ...titleParts] = fileName.split('-')

    const title = titleParts
      .join(' ')
      .replace(/\b\w/g, char => char.toUpperCase())

    return {
      id: fileName,
      number: Number(number),
      title,
      narrator: 'Ethan Crowley',
      content
    }
  })
  .sort((a, b) => a.number - b.number)

function getPortrait(characterId) {
  return `/becoming/assets/${characterId}-portrait.png`
}

function SigilDivider() {
  return <div className="sigilDivider"><span/>✦<span/></div>
}

function Section({ title, eyebrow, children, className = '' }) {
  return <section className={`section ${className}`}>
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    <SigilDivider />
    {children}
  </section>
}

function Card({ children, className = '' }) {
  return <div className={`card ornament ${className}`}>{children}</div>
}

function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

function Sidebar({ page }) {
  return <aside className="sidebar">
    <a href="#home" className="brand" aria-label="Becoming Home">
      <span className="brandSeal"><span>☽</span></span>
      <strong>Becoming</strong>
      <small>Ravenfall Archive</small>
    </a>

    <nav className="sideNav">
      {nav.map(([id, label]) => (
        <a key={id} className={page === id ? 'active' : ''} href={`#${id}`}>
          <Feather size={16}/><span>{label}</span>
        </a>
      ))}
    </nav>

    <div className="sidebarQuote">
      <Skull size={22}/>
      <p>“Nel buio non si fugge.<br/>Nel buio si diventa.”</p>
    </div>
  </aside>
}

function Topbar() {
  return <header className="topbar">
    <div className="topNav">
      <a href="#ravenfall">Il mondo</a>
      <a href="#personaggi">Schede</a>
      <a href="#misteri">Indagini</a>
      <a href="#campagna">Salvataggio</a>
    </div>
    <div className="topIcons"><span>☉</span><span>☽</span><span>✦</span></div>
  </header>
}


function Meter({ label, value, max = 100, tone = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return <div className="meter">
    <label>{label}<span>{value}/{max}</span></label>
    <div><i className={tone} style={{ width: `${pct}%` }} /></div>
  </div>
}

function CharacterCard({ character, compact = false }) {
  const becoming = (character.becoming_stage ?? 0) * 20
  return <Card className={`characterSheet ${compact ? 'compact' : ''}`}>
    <div className="panelTitle"><Users size={18}/><span>Scheda personaggio</span></div>
    <div className="sheetHeader">
      <div className="portraitFrame">
        <img
          src={getPortrait(character.id)}
          alt={`Ritratto di ${character.name}`}
        />
      </div>
      <div className="sheetIdentity">
        <p className="eyebrow tiny">{character.race_public || 'Sconosciuto'}</p>
        <h3>{character.name}</h3>
        <p><strong>Stato:</strong> {character.health || 'sconosciuto'}</p>
        <p><strong>Becoming:</strong> Stadio {character.becoming_stage ?? 0}</p>
      </div>
    </div>
    <div className="meters">
      <Meter label="Umanità" value={character.humanity ?? 100} tone="red" />
      <Meter label="Becoming" value={becoming} tone="violet" />
    </div>
    <div className="sheetTabs"><button>Abilità</button><button>Diario</button><button>Relazioni</button></div>
  </Card>
}

function Hero() {
  return <section className="hero ornament">
    <div className="heroImage" />
    <div className="heroCopy">     
    </div>
    <div className="moonStatus">
      <Moon size={26}/>
      <span>Escalation</span>
      <strong>{campaign.world_state.escalation_name || 'Inquietudine'}</strong>
    </div>
  </section>
}

function Home() {
  const ethan = campaign.players?.find(p => p.id === 'ethan') || campaign.players?.[0]
  return <>
    <Hero />

    <Section eyebrow="Archivio vivo" title="La campagna in una schermata">
      <div className="grid three">
        <Card className="feature"><Sparkles/><h3>Il simbolo</h3><p>Compare nei sogni, nei libri antichi, sulle mura della città e sul ciondolo di Ethan.</p></Card>
        <Card className="feature"><Users/><h3>Gli scomparsi</h3><p>Mark Hale è sparito da due giorni. Nel sogno di Lydia ha pronunciato il nome di Ethan.</p></Card>
        <Card className="feature"><BookOpen/><h3>Il libro</h3><p><em>De Generatione Intermedia</em> parla di stirpi che non avrebbero dovuto esistere.</p></Card>
      </div>
    </Section>
  </>
}

function Campagna() {
  const events = campaign.event_log || []
  return <Section eyebrow="Salvataggio" title={campaign.campaign.name}>
    <Card className="sceneCard"><h3>Scena corrente</h3><p>{campaign.session.last_scene}</p><p><strong>Ripresa:</strong> {campaign.session.resume_from}</p></Card>
    <div className="timeline">{events.map((e, i) => <Card key={i} className="timelineItem"><small>Sessione {e.session ?? '?'}</small><h3>{e.title}</h3><p>{e.description}</p></Card>)}</div>
  </Section>
}

function Cronache() {
  const [selectedChapter, setSelectedChapter] = useState(chapters[0])

  return (
    <section className="chronicles-page">
      <div className="section-heading">
        <p className="eyebrow">Cronache</p>
        <h2>Le Cronache di Ravenfall</h2>

        <p>
          La storia degli eventi accaduti a Ravenfall,
          narrata dai suoi protagonisti.
        </p>
      </div>

      <div className="chronicles-layout">
        <aside className="chapter-index">
          <h3>Capitoli</h3>

          {chapters.map(chapter => (
            <button
              key={chapter.id}
              className={
                selectedChapter.id === chapter.id
                  ? 'chapter-link active'
                  : 'chapter-link'
              }
              onClick={() => setSelectedChapter(chapter)}
            >
              <span>Cap. {chapter.number} - </span>
              <strong>{chapter.title}</strong>
            </button>
          ))}
        </aside>

        <article className="chapter-book">
          <div className="chapter-header">
            <p className="chapter-number">
              Capitolo {selectedChapter.number}
            </p>

            <h1>{selectedChapter.title}</h1>

            <div className="chapter-meta">
              Narratore: {selectedChapter.narrator}
            </div>
          </div>

          <div className="chapter-content">
            <ReactMarkdown>
              {selectedChapter.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </section>
  )
}

function Personaggi() {
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [characterView, setCharacterView] = useState('cards')

  const allCharacters = [
    ...(campaign.players || []).map(p => ({
      ...p,
      type: 'Protagonista',
      image: getPortrait(p.id)
    })),
    ...(campaign.npcs || []).map(n => ({
      ...n,
      type: 'PNG',
      image: getPortrait(n.id)
    }))
  ]

  return (
    <section className="characters-page">
      <div className="section-heading">
        <div className="view-switcher">
          <button
            className={characterView === 'cards' ? 'active' : ''}
            onClick={() => setCharacterView('cards')}
          >
            Tessere personaggi
          </button>

          <button
            className={characterView === 'network' ? 'active' : ''}
            onClick={() => setCharacterView('network')}
          >
            Rete relazioni
          </button>
        </div>
        <p className="eyebrow">Archivio Personaggi</p>
        <h1>PNG di Ravenfall</h1>
        <p>
          Ogni personaggio custodisce un segreto, una ferita o una possibile trasformazione.
        </p>
      </div>

      {characterView === 'cards' ? (
        <div className="character-grid">
          {allCharacters.map(character => (
            <button
              key={character.id}
              className="character-card"
              onClick={() => setSelectedCharacter(character)}
            >
              <img src={character.image} alt={character.name} />
              <div>
                <h3>{character.name}</h3>
                <p>{character.type}</p>
                <span>
                  {character.race_public ||
                    character.race_real ||
                    character.relationship ||
                    'Sconosciuto'}
                </span>
              </div>
            </button>
          ))}
        </div>
    ) : (
        <RelationshipNetwork
          characters={allCharacters}
          onSelectCharacter={setSelectedCharacter}
        />
    )}

      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </section>
  )
}

function RelationshipNetwork({
  characters,
  onSelectCharacter
}) {
  const relationships = campaign.relationships || []

  const characterIds = characters.map(c => c.id)

  const rawNodes = characters.map((character) => ({
    id: character.id,
    data: {
      label: (
        <div className="flow-character-node" onClick={() => onSelectCharacter(character)}>
          <img src={character.image} alt={character.name} />
          <strong>{character.name}</strong>
          <span>{character.type}</span>
        </div>
      ),
    },
    type: 'default',
  }))

  const rawEdges = relationships
    .filter(rel =>
      characterIds.includes(rel.source) &&
      characterIds.includes(rel.target)
    )
    .map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.source,
      target: rel.target,
      label: rel.type || rel.status || 'relazione',
      animated: rel.animated || false,
      type: 'smoothstep',
    }))

  const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges)

  return (
    <div className="relationship-flow-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

function getLayoutedElements(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph()

  dagreGraph.setDefaultEdgeLabel(() => ({}))

  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 90,
    ranksep: 160,
  })

  const nodeWidth = 230
  const nodeHeight = 160

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return {
    nodes: layoutedNodes,
    edges,
  }
}

function CharacterModal({ character, onClose }) {
  const attributes = character.attributes || {}
  const talents = character.talents || []
  const equipment = character.equipment || []
  const powers = character.powers || []
  const mutations = character.mutations || []
  const goals = character.goals || []

  const health = character.health_points || character.health || 5
  const stress = character.stress || 0

  return (
    <div className="character-modal">
      <button className="modal-close" onClick={onClose}>×</button>

      <article className="character-sheet-book">
        <div className="sheet-header">
          <p>Scheda Personaggio</p>
          <h1>{character.name}</h1>
          <span>{character.race_real || character.race_public || character.type}</span>
        </div>

        <div className="sheet-book-grid">
          <div className="sheet-left-page">
            <div className="portrait-frame" style={{ float: 'left' }}>
              <img src={character.image} alt={character.name} />
            </div>

            <SheetBox title="Identità">
              <p><strong>Tipo:</strong> {character.type}</p>
              <p><strong>Razza apparente:</strong> {character.race_public || '—'}</p>
              <p><strong>Razza reale:</strong> {character.race_real || '—'}</p>
              <p><strong>Ruolo:</strong> {character.role || character.profession || '—'}</p>
              <p><strong>Posizione:</strong> {character.location || '—'}</p>
            </SheetBox>

            <div style={{ clear: 'both' }}></div>

            <SheetBox title="Stato">
              <DotTrack label="Salute" value={Number(health)} max={5} />
              <DotTrack label="Stress" value={Number(stress)} max={5} />
              <p className="stress-note">Stress massimo: Panico, Rabbia e Perdita di controllo.</p>
            </SheetBox>

            <SheetBox title="Caratteristiche">
              <StatRow label="Istinto" value={attributes.istinto} />
              <StatRow label="Volontà" value={attributes.volonta} />
              <StatRow label="Influenza" value={attributes.influenza} />
              <StatRow label="Anomalia" value={attributes.anomalia} />
            </SheetBox>

            <SheetBox title="Equipaggiamento">
              <ListItems items={equipment} />
            </SheetBox>
          </div>

          <div className="sheet-right-page">
            <SheetBox title="Talenti">
              <div className="talent-list">
                {['Investigatore', 'Predatore', 'Carismatico', 'Indomabile', 'Sensitivo', 'Alchimista', 'Sopravvissuto', 'Altro'].map(talent => (
                  <span key={talent}>
                    {talents.includes(talent) ? '☑' : '☐'} {talent}
                  </span>
                ))}
              </div>
            </SheetBox>            

            <SheetBox title="Poteri acquisiti">
              <ListItems items={powers} />
            </SheetBox>

            <SheetBox title="Mutazioni">
              <ListItems items={mutations} />
            </SheetBox>

            <SheetBox title="Obiettivi">
              <ListItems items={goals} />
            </SheetBox>

            <SheetBox title="Relazioni">
              <CharacterRelationships characterId={character.id} />
            </SheetBox>
          </div>
        </div>
      </article>
    </div>
  )
}

function SheetBox({ title, children }) {
  return (
    <div className="sheet-box">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function DotTrack({ label, value, max }) {
  return (
    <div className="dot-track">
      <span>{label}</span>
      <div>
        {Array.from({ length: max }).map((_, index) => (
          <i key={index} className={index < value ? 'filled' : ''} />
        ))}
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  )
}

function ListItems({ items }) {
  if (!items || items.length === 0) return <p className="empty-line">—</p>

  return (
    <ul className="sheet-list">
      {items.map((item, index) => (
        <li key={index}>{typeof item === 'string' ? item : item.name || item.description}</li>
      ))}
    </ul>
  )
}

function CharacterRelationships({ characterId }) {
  const rels = (campaign.relationships || []).filter(r => r.source === characterId)

  if (rels.length === 0) return <p className="empty-line">—</p>

  return (
    <ul className="sheet-list">
      {rels.map((rel, index) => (
        <li key={index}>
          <strong>{rel.target}</strong>: {rel.status}
        </li>
      ))}
    </ul>
  )
}



function Row({ label, value }) {
  return (
    <div className="identityRow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function List({ items, empty }) {
  if (!items || items.length === 0) {
    return <p className="emptyText">{empty}</p>
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
      ))}
    </ul>
  )
}

function Misteri() {
  return <Section eyebrow="Indagine" title="Misteri e indizi aperti">
    <div className="grid two">{campaign.mysteries.map(m => <Card key={m.id} className="mysteryCard"><h3>{m.name}</h3><p><strong>Stato:</strong> {m.status}</p><div className="progress"><i style={{ width: `${m.progress || 0}%` }} /></div></Card>)}</div>
    <h3 className="sub">Indizi scoperti</h3>
    <div className="grid two">{campaign.clues.map(c => <Card key={c.id}><h3>{c.title || c.id}</h3><p>{c.description}</p><small>{c.location || 'Luogo non indicato'}</small></Card>)}</div>
    <h3 className="sub">Trame aperte</h3>
    <ul className="threads">{campaign.open_threads.map((t, i) => <li key={i}>{t}</li>)}</ul>
  </Section>
}

function Ravenfall() {
  return (
    <Section eyebrow="Mappa della città" title="Ravenfall">
      <InteractiveMap />
    </Section>
  )
}

function Regole() {
  return <Section eyebrow="Sistema" title="Regole rapide">
    <div className="grid three">
      <Card><Shield/><h3>1d6</h3><p>1–2 fallimento con complicazione.<br></br> 3–4 successo parziale.<br></br> 5–6 successo pieno.</p></Card>
      <Card><Eye/><h3>Becoming</h3><p>Non è esperienza: è trasformazione. Ogni potere ha un prezzo.</p></Card>
      <Card><Moon/><h3>Escalation</h3><p>Il mondo evolve anche se i protagonisti non intervengono.</p></Card>
    </div>
  </Section>
}

function App() {
  const [page, setPage] = useState(location.hash.replace('#', '') || 'home')
  useEffect(() => {
    const f = () => setPage(location.hash.replace('#', '') || 'home')
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  const Page = useMemo(() => ({ home: Home, campagna: Campagna, cronache: Cronache, personaggi: Personaggi, misteri: Misteri, ravenfall: Ravenfall, regole: Regole }[page] || Home), [page])
  return <div className="appShell"><Sidebar page={page}/><div className="contentShell"><main><Page /></main><footer>Becoming – Campagna I: La Nuova Razza · Archivio narrativo pubblico</footer></div></div>
}

createRoot(document.getElementById('root')).render(<App />)
