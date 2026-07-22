'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';

export default function PeoplePage() {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  const groups = useMemo(() => {
    return ['All', ...Array.from(new Set(data.people.map((p) => p.group)))];
  }, [data.people]);

  const filteredPeople = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return data.people.filter((p) => {
      const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
      const matchesQuery = !q || `${p.name} ${p.role} ${p.bio} ${p.interests}`.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [data.people, searchTerm, selectedGroup]);

  const initials = (name: string) => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase() || 'RL';
  };

  return (
    <PageGuard pageKey="people" title="People">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">People</span>
          <h1>A multidisciplinary research community.</h1>
          <p>
            Meet the faculty, research scholars, project staff, students, alumni, and collaborators who shape the lab.
          </p>
        </section>

        <section className="section">
          <div className="toolbar">
            <input
              className="input"
              type="search"
              placeholder="Search people or interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {filteredPeople.length > 0 ? (
            <div className="grid grid-3">
              {filteredPeople.map((person) => (
                <article key={person.id} className="card people-card">
                  <div className="person-visual">
                    {person.image ? (
                      <img src={person.image} alt={person.name} loading="lazy" />
                    ) : (
                      <div className="avatar-fallback">{initials(person.name)}</div>
                    )}
                  </div>
                  <div className="person-body">
                    <div className="person-role">
                      {person.group} · {person.role}
                    </div>
                    <h3>{person.name}</h3>
                    <p>{person.bio}</p>
                    <div className="card-meta">
                      {String(person.interests || '')
                        .split(',')
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((x, i) => (
                          <span key={i} className="tag">
                            {x.trim()}
                          </span>
                        ))}
                    </div>
                    <a className="card-link" href={`mailto:${person.email}`}>
                      {person.email}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">No matching people found.</div>
          )}
        </section>
      </div>
    </PageGuard>
  );
}
