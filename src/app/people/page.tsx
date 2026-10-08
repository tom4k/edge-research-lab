'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';
import { PersonPublicationsModal } from '@/components/PersonPublicationsModal';
import { ThemeAvatar } from '@/components/ThemeAvatar';
import { Person } from '@/lib/types';

export default function PeoplePage() {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [modalPerson, setModalPerson] = useState<Person | null>(null);

  const groups = useMemo(() => {
    return ['All', ...Array.from(new Set(data.people.map((p) => p.group)))];
  }, [data.people]);

  const filteredPeople = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return data.people.filter((p) => {
      const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
      const matchesQuery = !q || `${p.name} ${p.role} ${p.interests}`.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [data.people, searchTerm, selectedGroup]);

  const getPersonPublications = (person: Person) => {
    const lastName = person.name.split(/\s+/).pop() || person.name;
    return data.publications.filter(
      (pub) => pub.personId === person.id || pub.authors.toLowerCase().includes(lastName.toLowerCase())
    );
  };

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
              {filteredPeople.map((person) => {
                const personPubs = getPersonPublications(person);
                return (
                  <article key={person.id} className="card people-card">
                    <ThemeAvatar src={person.image} name={person.name} />
                    <div className="person-body">
                      <div className="person-role">
                        {person.group} · {person.role}
                      </div>
                      <h3>{person.name}</h3>
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
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <a className="card-link" href={`mailto:${person.email}`}>
                          {person.email}
                        </a>
                        <button
                          className="button button-small button-outline"
                          onClick={() => setModalPerson(person)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                          📚 Publications ({personPubs.length})
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No matching people found.</div>
          )}
        </section>

        {modalPerson && (
          <PersonPublicationsModal
            isOpen={!!modalPerson}
            onClose={() => setModalPerson(null)}
            personName={modalPerson.name}
            publications={getPersonPublications(modalPerson)}
          />
        )}
      </div>
    </PageGuard>
  );
}
