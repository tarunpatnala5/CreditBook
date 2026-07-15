// Credit Book — Home Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { personsApi } from '../../api';
import { formatCurrency, getInitials, formatRelative } from '../../utils';
import { registerModalCloser } from '../../utils/navigationCallbacks';
import { NavigationBar } from '../../components/layout/AppLayout';
import {
  Button, Avatar, BottomSheet, TextField, EmptyState,
  SkeletonRow, LoadingScreen, Dialog,
} from '../../components/ui/Components';
import './Home.css';

// ─── Add Person Sheet ──────────────────────────────────────────────────────
function AddPersonSheet({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPhone('');
      setErrors({});
    }
  }, [isOpen]);

  const { mutate: createPerson, isPending } = useMutation({
    mutationFn: (data) => personsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      toast.success('Person added!');
      onClose();
    },
    onError: (err) => setErrors({ api: err.message || 'Failed to add person' }),
  });

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!name.trim())  errs.name  = 'Name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    // Accept any number: optional + prefix, then 7-15 digits (spaces/dashes allowed)
    else if (!/^\+?[\d][\d\s\-()]{6,14}$/.test(phone.trim())) errs.phone = 'Enter a valid phone number';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    createPerson({ name: name.trim(), phone: phone.trim() });
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Person">
      <form className="add-person-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="add-person-name"
          label="Name"
          value={name}
          onChange={(v) => { setName(v); setErrors((p) => ({ ...p, name: '' })); }}
          placeholder="Full name"
          autoFocus
          error={errors.name}
        />
        <TextField
          id="add-person-phone"
          label="Phone Number"
          value={phone}
          onChange={(v) => { setPhone(v); setErrors((p) => ({ ...p, phone: '' })); }}
          placeholder="Phone number"
          type="tel"
          inputMode="tel"
          error={errors.phone}
        />
        {errors.api && (
          <div style={{ color: 'var(--color-red)', fontSize: 13 }}>{errors.api}</div>
        )}
        <Button id="add-person-submit" variant="primary" size="md" fullWidth loading={isPending}>
          Add Person
        </Button>
      </form>
    </BottomSheet>
  );
}

// ─── Person Row ───────────────────────────────────────────────────────
function PersonRow({ person, index, onClick }) {
  const balance = parseFloat(person.balance) || 0;
  const interestTabTotal = parseFloat(person.interestTabTotal) || 0;
  // Display total = current balance + full live interest tab amount
  const displayTotal = Math.abs(balance) + interestTabTotal;
  const isScheduledDelete = !!person.deleteScheduledAt;

  return (
    <div
      className="person-row"
      onClick={onClick}
      id={`person-row-${person.id}`}
      style={{
        animationDelay: `${index * 30}ms`,
        opacity: isScheduledDelete ? 0.5 : 1,
      }}
    >
      <Avatar name={person.name} color={person.avatarColor} size={46} />
      <div className="person-row-info">
        <span className="person-row-name">{person.name}</span>
        {person.lastActivityAt && (
          <span className="person-row-sub">{formatRelative(person.lastActivityAt)}</span>
        )}
      </div>
      <div className="person-row-balance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span className={`person-balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance >= 0 ? '+' : '-'}{formatCurrency(displayTotal)}
        </span>
        {isScheduledDelete && (
          <span style={{ fontSize: 10, color: 'var(--color-orange)', marginTop: 2 }}>Deleting soon</span>
        )}
      </div>
      <svg className="person-row-chevron" width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1l5 5-5 5" />
      </svg>
    </div>
  );
}


// ─── Home Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [addPersonOpen, setAddPersonOpen] = useState(false);

  // Register synchronous modal closer — called BEFORE navigate() fires
  useEffect(() => {
    return registerModalCloser(() => {
      setAddPersonOpen(false);
      setSearchActive(false);
    });
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['persons', searchValue],
    queryFn: () => personsApi.getAll({ search: searchValue || undefined }),
    select: (d) => d?.data,
  });

  // Filter out persons scheduled for deletion (owner sees them disappear immediately)
  const persons = (data?.persons || []).filter((p) => !p.deleteScheduledAt);
  const totalGive = data?.totalGive || 0;
  const totalGet = data?.totalGet || 0;

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <NavigationBar
        title="Credit Book"
        logo
        onSearch={() => setSearchActive(true)}
        onAdd={() => setAddPersonOpen(true)}
        searchActive={searchActive}
        onSearchChange={setSearchValue}
        searchValue={searchValue}
        onSearchClose={() => { setSearchActive(false); setSearchValue(''); }}
      />

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-text">
            <span className="summary-card-label">You Will Get</span>
            <span className="summary-card-sub">Total receivable</span>
          </div>
          <span className={`summary-card-amount positive`}>{formatCurrency(totalGet)}</span>
        </div>
        <div className="summary-card">
          <div className="summary-card-text">
            <span className="summary-card-label">You Will Give</span>
            <span className="summary-card-sub">Total payable</span>
          </div>
          <span className={`summary-card-amount negative`}>{formatCurrency(totalGive)}</span>
        </div>
      </div>

      {/* Persons List */}
      <div className="persons-list">
        {!searchActive && (
          <div className="persons-list-header">
            <span className="persons-list-title">
              {persons.length} {persons.length === 1 ? 'Person' : 'People'}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="persons-container">
            {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : isError ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load entries"
            body={error?.message || 'Something went wrong. Please try again.'}
            action={{ label: 'Retry', onClick: () => refetch() }}
          />
        ) : persons.length === 0 ? (
          <EmptyState
            icon={searchActive ? '🔍' : '👥'}
            title={searchActive ? 'No results' : 'No people yet'}
            body={searchActive ? `No one matches "${searchValue}"` : 'Tap + to add the first person to your ledger'}
            action={!searchActive ? { label: 'Add Person', onClick: () => setAddPersonOpen(true) } : undefined}
          />
        ) : (
          <div className="persons-container">
            {persons.map((person, i) => (
              <PersonRow
                key={person.id}
                person={person}
                index={i}
                onClick={() => navigate(`/persons/${person.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Person Sheet */}
      <AddPersonSheet isOpen={addPersonOpen} onClose={() => setAddPersonOpen(false)} />
    </div>
  );
}
