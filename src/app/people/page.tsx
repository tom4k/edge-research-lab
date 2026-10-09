'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { PageGuard } from '@/components/PageGuard';
import { PersonPublicationsModal } from '@/components/PersonPublicationsModal';
import { ThemeAvatar } from '@/components/ThemeAvatar';
import { Person } from '@/lib/types';
import { formatLinkedInUrl } from '@/lib/publicationUtils';

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
      const matchesQuery = !q || `${p.name} ${p.role} ${p.interests} ${p.linkedin || ''}`.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [data.people, searchTerm, selectedGroup]);

  const getPersonPublications = (person: Person) => {
    const lastName = (person.name || '').trim().split(/\s+/).pop()?.toLowerCase();
    return (data.publications || []).filter((pub) => {
      if (pub.personId) {
        return pub.personId === person.id;
      }
      return !!(lastName && lastName.length >= 2 && pub.authors?.toLowerCase().includes(lastName));
    });
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
                      <div className="person-actions">
                        <div className="person-links">
                          {person.email && (
                            <a
                              className="person-link person-email"
                              href={`mailto:${person.email}`}
                              title={person.email}
                            >
                              <span>✉</span>
                              <span className="person-link-text">{person.email}</span>
                            </a>
                          )}
                          {person.linkedin && (
                            <a
                              className="person-link person-linkedin"
                              href={formatLinkedInUrl(person.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`${person.name} on LinkedIn`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
                              </svg>
                              <span className="person-link-text">LinkedIn</span>
                            </a>
                          )}
                        </div>
                        <button
                          className="button button-small button-outline person-pubs-btn"
                          onClick={() => setModalPerson(person)}
                        >
                          Publications
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
