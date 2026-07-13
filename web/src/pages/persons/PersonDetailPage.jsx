// Credit Book — Person Detail Page
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { personsApi, transactionsApi } from '../../api';
import { formatCurrency, formatDate, getInitials } from '../../utils';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import {
  Avatar, Button, BottomSheet, TextField, Dialog,
  LoadingScreen, EmptyState, Spinner,
} from '../../components/ui/Components';
import './PersonDetail.css';

// ─── Add Transaction Sheet ─────────────────────────────────────────────────
function AddTransactionSheet({ isOpen, onClose, personId, type }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => transactionsApi.create(personId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', personId] });
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      toast.success(`Entry saved!`);
      setAmount(''); setDescription(''); setDate(''); setInterestRate('');
      onClose();
    },
    onError: (err) => setError(err.message || 'Failed to save'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    setError('');
    mutate({
      type,
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      transactionDate: date || undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
    });
  }

  const isGave = type === 'gave';
  const title = isGave ? 'You Gave ₹' : 'You Got ₹';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <form className="add-txn-form" onSubmit={handleSubmit}>
        <TextField
          id="txn-amount"
          label="Amount"
          value={amount}
          onChange={setAmount}
          placeholder="0"
          type="number"
          inputMode="decimal"
          prefix="₹"
          autoFocus
          error={error && !amount ? error : ''}
        />
        <TextField
          id="txn-description"
          label="Note (optional)"
          value={description}
          onChange={setDescription}
          placeholder="What's this for?"
          autoComplete="off"
        />
        <TextField
          id="txn-date"
          label="Date & Time (optional)"
          value={date}
          onChange={setDate}
          type="datetime-local"
        />
        <TextField
          id="txn-interest"
          label="Interest Rate % / year (optional)"
          value={interestRate}
          onChange={setInterestRate}
          placeholder="e.g. 12"
          type="number"
          inputMode="decimal"
        />
        {error && amount && <div style={{ color: 'var(--color-red)', fontSize: 13 }}>{error}</div>}
        <div className="txn-form-actions">
          <Button
            id="txn-cancel-btn"
            variant="secondary"
            size="md"
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button
            id="txn-save-btn"
            variant={isGave ? 'destructive' : 'positive'}
            size="md"
            loading={isPending}
          >
            Save
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}

// ─── Edit Transaction Sheet ────────────────────────────────────────────────
function EditTransactionSheet({ isOpen, onClose, transaction, personId }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [interestRate, setInterestRate] = useState(transaction?.interestRate?.toString() || '');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount?.toString() || '');
      setDescription(transaction.description || '');
      setInterestRate(transaction.interestRate?.toString() || '');
    }
  }, [transaction]);

  const { mutate: updateTxn, isPending: isUpdating } = useMutation({
    mutationFn: (data) => transactionsApi.update(personId, transaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', personId] });
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      toast.success('Entry updated!');
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: () => transactionsApi.delete(personId, transaction.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', personId] });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      toast.success('Entry deleted');
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSave(e) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    updateTxn({
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      interestRate: interestRate ? parseFloat(interestRate) : null,
    });
  }

  if (!transaction) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Entry">
      <form className="add-txn-form" onSubmit={handleSave}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--fill-tertiary)', borderRadius: 12, padding: '10px 16px', marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--label-secondary)' }}>Type:</span>
          <span style={{ fontWeight: 600, color: transaction.type === 'got' ? 'var(--app-positive)' : 'var(--app-negative)' }}>
            {transaction.type === 'got' ? 'You Got' : 'You Gave'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--label-tertiary)' }}>{formatDate(transaction.transactionDate)}</span>
        </div>
        <TextField id="edit-txn-amount" label="Amount" value={amount} onChange={setAmount} placeholder="0" type="number" inputMode="decimal" prefix="₹" error={error} />
        <TextField id="edit-txn-desc" label="Note (optional)" value={description} onChange={setDescription} placeholder="What's this for?" autoComplete="off" />
        <TextField id="edit-txn-interest" label="Interest % / year (optional)" value={interestRate} onChange={setInterestRate} placeholder="e.g. 12" type="number" inputMode="decimal" />

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <Button id="edit-txn-delete" variant="destructive" size="md" style={{ flex: 1 }} loading={isDeleting} onClick={(e) => { e.preventDefault(); deleteTxn(); }}>Delete</Button>
          <Button id="edit-txn-save" variant="primary" size="md" style={{ flex: 1 }} loading={isUpdating}>Save</Button>
        </div>
      </form>
    </BottomSheet>
  );
}

// ─── Transaction Card ──────────────────────────────────────────────────────
function TransactionCard({ txn, index, onClick }) {
  const isGot = txn.type === 'got';
  const hasInterest = !!txn.interestRate;
  const interestAccrued = txn.currentAmount - txn.amount;

  return (
    <div className="transaction-card" onClick={onClick} style={{ animationDelay: `${index * 35}ms` }}>
      {/* Row 1: Description (left, prominent) + Amount (right) */}
      <div className="transaction-card-top">
        <div className="transaction-desc-left">
          {txn.description
            ? <span className="transaction-description-main">{txn.description}</span>
            : <span className="transaction-amount-label-inline">{isGot ? 'You Got' : 'You Gave'}</span>
          }
          <div className="transaction-amount-label">
            {txn.description ? (isGot ? 'You Got' : 'You Gave') : ''}
            {hasInterest && interestAccrued > 0.01 && (
              <> · <span style={{ color: 'var(--color-orange)' }}>+{formatCurrency(interestAccrued)} int.</span></>
            )}
          </div>
        </div>
        <div className="transaction-right-col">
          <div className={`transaction-amount ${txn.type}`}>
            {formatCurrency(txn.currentAmount)}
          </div>
          {hasInterest && (
            <div className="transaction-interest-badge">{txn.interestRate}% p.a.</div>
          )}
        </div>
      </div>
      {/* Row 2: Date/Time (left) + Balance chip (right) */}
      <div className="transaction-card-meta">
        <span className="transaction-date">{formatDate(txn.transactionDate)}</span>
        {txn.balanceAfter !== undefined && (
          <div className="transaction-balance-chip">
            Bal: {formatCurrency(Math.abs(txn.balanceAfter))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Person Options Sheet ──────────────────────────────────────────────────
function PersonOptionsSheet({ isOpen, onClose, person, onEdit, onDelete }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="person-options">
        <button className="person-option-btn" onClick={() => { onClose(); onEdit(); }} id="option-edit-person">
          <span>✏️</span> Edit Name & Phone
        </button>
        <button className="person-option-btn destructive" onClick={() => { onClose(); onDelete(); }} id="option-delete-person">
          <span>🗑️</span> Delete Person
        </button>
      </div>
    </BottomSheet>
  );
}

// ─── Edit Person Sheet ─────────────────────────────────────────────────────
function EditPersonSheet({ isOpen, onClose, person, personId }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(person?.name || '');
  const [phone, setPhone] = useState(person?.phone || '');

  React.useEffect(() => {
    if (person) { setName(person.name || ''); setPhone(person.phone || ''); }
  }, [person]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => personsApi.update(personId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      toast.success('Person updated!');
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Person">
      <form className="add-txn-form" onSubmit={(e) => { e.preventDefault(); mutate({ name, phone }); }}>
        <TextField id="edit-person-name" label="Name" value={name} onChange={setName} placeholder="Full name" />
        <TextField id="edit-person-phone" label="Phone Number" value={phone} onChange={setPhone} placeholder="98765 43210" type="tel" />
        <Button id="edit-person-save" variant="primary" size="md" fullWidth loading={isPending}>
          Save Changes
        </Button>
      </form>
    </BottomSheet>
  );
}

// ─── Person Detail Page ────────────────────────────────────────────────────
export default function PersonDetailPage() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('current');
  const [addType, setAddType] = useState(null); // 'gave' | 'got'
  const [editTxn, setEditTxn] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: personData, isLoading: personLoading } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => personsApi.getOne(personId),
    select: (d) => d?.data,
  });

  const { data: txnData, isLoading: txnLoading } = useQuery({
    queryKey: ['transactions', personId, activeTab],
    queryFn: () => transactionsApi.getAll(personId, { status: activeTab }),
    select: (d) => d?.data,
  });

  const { mutate: scheduleDeletion, isPending: isDeleting } = useMutation({
    mutationFn: () => personsApi.scheduleDeletion(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      toast.success('Person will be deleted in 24 hours. You can restore from home screen.');
      setDeleteDialogOpen(false);
      navigate('/');
    },
    onError: (err) => toast.error(err.message),
  });

  if (personLoading) return <><PageNavigationBar title="" /><LoadingScreen /></>;

  const person = personData;
  if (!person) return <><PageNavigationBar title="Not Found" /><EmptyState icon="❓" title="Person not found" body="This person may have been deleted." /></>;

  const transactions = txnData?.transactions || [];
  const balance = parseFloat(person.balance) || 0;

  const balanceLabel = balance > 0
    ? `You will get`
    : balance < 0
    ? `You will give`
    : 'All settled up';

  const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero';

  return (
    <div className="person-detail-page">
      {/* Navigation Bar */}
      <div className="nav-bar-page">
        <button className="nav-back-btn" onClick={() => navigate(-1)} id="nav-back-btn">
          <svg width="10" height="16" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1L1 9l8 8" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
          <Avatar name={person.name} color={person.avatarColor} size={32} />
          <span className="nav-page-title" style={{ textAlign: 'left' }}>{person.name}</span>
        </div>
        <button className="nav-page-action" onClick={() => setOptionsOpen(true)} id="person-options-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Balance Card */}
      <div className={`balance-card ${balanceClass}`}>
        <div className="balance-row">
          <span className="balance-label">{balanceLabel}</span>
          <span className="balance-amount">{formatCurrency(Math.abs(balance))}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="tab-pills">
        <button
          className={`tab-pill ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
          id="tab-current"
        >
          Current
        </button>
        <button
          className={`tab-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
          id="tab-upcoming"
        >
          ⏰ Upcoming
        </button>
      </div>

      {/* Transactions */}
      <div className="transactions-list">
        {txnLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 13 }} />
          ))
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={activeTab === 'upcoming' ? '⏰' : '📋'}
            title={activeTab === 'upcoming' ? 'No upcoming entries' : 'No entries yet'}
            body={activeTab === 'upcoming'
              ? 'Entries with a future date will appear here'
              : 'Use the buttons below to add an entry'}
          />
        ) : (
          transactions.map((txn, i) => (
            <TransactionCard key={txn.id} txn={txn} index={i} onClick={() => setEditTxn(txn)} />
          ))
        )}
      </div>

      {/* Action Buttons (You Gave / You Got) */}
      {activeTab === 'current' && (
        <div className="action-buttons">
          <button className="action-btn action-btn-gave" onClick={() => setAddType('gave')} id="btn-gave">
            YOU GAVE ₹
          </button>
          <button className="action-btn action-btn-got" onClick={() => setAddType('got')} id="btn-got">
            YOU GOT ₹
          </button>
        </div>
      )}

      {/* Sheets & Dialogs */}
      <AddTransactionSheet
        isOpen={!!addType}
        onClose={() => setAddType(null)}
        personId={personId}
        type={addType}
      />
      <EditTransactionSheet
        isOpen={!!editTxn}
        onClose={() => setEditTxn(null)}
        transaction={editTxn}
        personId={personId}
      />
      <PersonOptionsSheet
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        person={person}
        onEdit={() => setEditPersonOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
      />
      <EditPersonSheet
        isOpen={editPersonOpen}
        onClose={() => setEditPersonOpen(false)}
        person={person}
        personId={personId}
      />
      <Dialog
        isOpen={deleteDialogOpen}
        title={`Delete ${person.name}?`}
        message="This person and all their entries will be removed. This cannot be undone."
        onClose={() => setDeleteDialogOpen(false)}
        actions={[
          { label: 'Cancel', onClick: () => setDeleteDialogOpen(false), id: 'dialog-cancel' },
          { label: 'Delete', onClick: () => scheduleDeletion(), destructive: true, id: 'dialog-delete' },
        ]}
      />
    </div>
  );
}
