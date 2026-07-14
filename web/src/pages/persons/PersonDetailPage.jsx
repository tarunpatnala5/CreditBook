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

// ─── Frequency label map ───────────────────────────────────────────────────
const FREQ_LABELS = {
  'annually':      'Annually',
  'semi-annually': 'Semi-Annually',
  'quarterly':     'Quarterly',
  'monthly':       'Monthly',
  'daily':         'Daily',
};

const FREQ_OPTIONS = Object.entries(FREQ_LABELS);

// ─── Interest Setup Modal ──────────────────────────────────────────────────
function InterestSetupModal({ isOpen, onClose, onSave, initialFrequency = 'annually', initialRate = '' }) {
  const [frequency, setFrequency] = useState(initialFrequency);
  const [rate, setRate] = useState(initialRate);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setFrequency(initialFrequency);
      setRate(initialRate);
      setError('');
    }
  }, [isOpen, initialFrequency, initialRate]);

  function handleSave() {
    if (!rate || parseFloat(rate) <= 0) {
      setError('Enter a valid interest rate');
      return;
    }
    onSave({ frequency, rate: parseFloat(rate) });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="interest-modal-overlay" onClick={onClose}>
      <div className="interest-modal" onClick={(e) => e.stopPropagation()}>
        <div className="interest-modal-header">
          <span className="interest-modal-title">Set Interest</span>
          <button className="interest-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Frequency Dropdown */}
        <div>
          <div className="interest-field-label">Compounding Frequency</div>
          <select
            className="interest-frequency-select"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            id="interest-frequency-select"
          >
            {FREQ_OPTIONS.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Rate Input */}
        <div>
          <div className="interest-field-label">Interest Rate % per year</div>
          <input
            className="interest-rate-input"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 12"
            value={rate}
            onChange={(e) => { setRate(e.target.value); setError(''); }}
            id="interest-rate-input"
            autoFocus
          />
          {error && <div style={{ color: 'var(--color-red)', fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>

        {/* Actions */}
        <div className="interest-modal-actions">
          <button className="interest-modal-cancel" onClick={onClose} id="interest-modal-cancel">
            Cancel
          </button>
          <button className="interest-modal-save" onClick={handleSave} id="interest-modal-save">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Transaction Sheet ─────────────────────────────────────────────────
function AddTransactionSheet({ isOpen, onClose, personId, type }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [interestData, setInterestData] = useState(null); // { frequency, rate }
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => transactionsApi.create(personId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', personId] });
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      toast.success(`Entry saved!`);
      setAmount(''); setDescription(''); setDate(''); setInterestData(null);
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
      interestRate: interestData?.rate ?? undefined,
      interestFrequency: interestData?.frequency ?? undefined,
    });
  }

  const isGave = type === 'gave';
  const title = isGave ? 'You Gave ₹' : 'You Got ₹';

  return (
    <>
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

          {/* Interest Button */}
          <button
            type="button"
            className="interest-btn-card"
            onClick={() => setInterestModalOpen(true)}
            id="interest-btn-card"
          >
            <div className="interest-btn-left">
              <span className="interest-btn-title">Interest (optional)</span>
              {interestData ? (
                <span className="interest-btn-subtitle">
                  {interestData.rate}% p.a. · {FREQ_LABELS[interestData.frequency]}
                </span>
              ) : null}
            </div>
            <span className="interest-btn-arrow">›</span>
          </button>

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

      <InterestSetupModal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        onSave={(data) => setInterestData(data)}
        initialFrequency={interestData?.frequency || 'annually'}
        initialRate={interestData?.rate?.toString() || ''}
      />
    </>
  );
}

// ─── Edit Transaction Sheet ────────────────────────────────────────────────
function EditTransactionSheet({ isOpen, onClose, transaction, personId }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [interestData, setInterestData] = useState(
    transaction?.interestRate
      ? { rate: transaction.interestRate, frequency: transaction.interestFrequency || 'annually' }
      : null
  );
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount?.toString() || '');
      setDescription(transaction.description || '');
      setInterestData(
        transaction.interestRate
          ? { rate: transaction.interestRate, frequency: transaction.interestFrequency || 'annually' }
          : null
      );
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
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
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
      interestRate: interestData?.rate || null,
      interestFrequency: interestData?.frequency || null,
    });
  }

  if (!transaction) return null;

  return (
    <>
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

          {/* Interest Button */}
          <button
            type="button"
            className="interest-btn-card"
            onClick={() => setInterestModalOpen(true)}
            id="edit-interest-btn-card"
          >
            <div className="interest-btn-left">
              <span className="interest-btn-title">Interest (optional)</span>
              {interestData ? (
                <span className="interest-btn-subtitle">
                  {interestData.rate}% p.a. · {FREQ_LABELS[interestData.frequency]}
                </span>
              ) : null}
            </div>
            <span className="interest-btn-arrow">›</span>
          </button>

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <Button id="edit-txn-delete" variant="destructive" size="md" style={{ flex: 1 }} loading={isDeleting} onClick={(e) => { e.preventDefault(); deleteTxn(); }}>Delete</Button>
            <Button id="edit-txn-save" variant="primary" size="md" style={{ flex: 1 }} loading={isUpdating}>Save</Button>
          </div>
        </form>
      </BottomSheet>

      <InterestSetupModal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        onSave={(data) => setInterestData(data)}
        initialFrequency={interestData?.frequency || 'annually'}
        initialRate={interestData?.rate?.toString() || ''}
      />
    </>
  );
}

// ─── Transaction Card ──────────────────────────────────────────────────────
function TransactionCard({ txn, index, onClick }) {
  const isGot = txn.type === 'got';
  const isInterest = txn.status === 'interest';
  const hasInterest = !!txn.interestRate;

  // For interest transactions — show live amount (Method B real-time)
  // For regular — show currentAmount
  const displayAmount = isInterest ? txn.liveAmount : txn.currentAmount;
  const interestAccrued = txn.interestAccrued || 0;

  return (
    <div
      className={`transaction-card${isInterest ? ' interest-txn' : ''}`}
      onClick={onClick}
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Row 1: Description (left) + Amount (right) */}
      <div className="transaction-card-top">
        <div className="transaction-desc-left">
          {txn.description
            ? <span className="transaction-description-main">{txn.description}</span>
            : <span className="transaction-amount-label-inline">{isGot ? 'You Got' : 'You Gave'}</span>
          }
          <div className="transaction-amount-label">
            {txn.description ? (isGot ? 'You Got' : 'You Gave') : ''}
            {hasInterest && interestAccrued > 0.01 && (
              <> · <span style={{ color: 'hsl(38, 70%, 42%)' }}>+{formatCurrency(interestAccrued)} int.</span></>
            )}
          </div>
        </div>

        <div className="transaction-right-col">
          {isInterest ? (
            <>
              <div className="transaction-live-amount">
                {formatCurrency(displayAmount)}
              </div>
              <div className="transaction-live-label">live · as of today</div>
            </>
          ) : (
            <div className={`transaction-amount ${txn.type}`}>
              {formatCurrency(displayAmount)}
            </div>
          )}
          {hasInterest && (
            <div className="transaction-interest-badge">
              {txn.interestRate}% · {FREQ_LABELS[txn.interestFrequency] || 'Annually'}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Date + Balance chip */}
      <div className="transaction-card-meta">
        <span className="transaction-date">{formatDate(txn.transactionDate)}</span>
        {!isInterest && txn.balanceAfter !== undefined && (
          <div className="transaction-balance-chip">
            Bal: {formatCurrency(Math.abs(txn.balanceAfter))}
          </div>
        )}
        {isInterest && (
          <div className="transaction-balance-chip" style={{ background: 'hsla(38,80%,55%,0.12)', color: 'hsl(38,60%,38%)' }}>
            Principal: {formatCurrency(txn.amount)}
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

// ─── Balance Card ─────────────────────────────────────────────────────────
function BalanceCard({ balance, totalInterestAccrued, balanceLabel, balanceClass }) {
  const principal = Math.abs(balance);
  const interest  = totalInterestAccrued || 0;
  const total     = principal + interest;

  return (
    <div className={`balance-card ${balanceClass}`}>
      <div className="balance-card-interest">
        <div className="balance-card-top-label">{balanceLabel}</div>
        <div className="balance-three-col">
          {/* Current */}
          <div className="balance-col">
            <div className="balance-col-value large">{formatCurrency(principal)}</div>
            <div className="balance-col-label">current</div>
          </div>

          <span className="balance-plus-sign">+</span>

          {/* Interest */}
          <div className="balance-col center">
            <div className="balance-col-interest-value">{formatCurrency(interest)}</div>
            <div className="balance-col-label">interest</div>
          </div>

          <span className="balance-equals-sign">=</span>

          {/* Total */}
          <div className="balance-col right">
            <div className="balance-col-value total">{formatCurrency(total)}</div>
            <div className="balance-col-label">total</div>
          </div>
        </div>
      </div>
    </div>
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const { data: personData, isLoading: personLoading } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => personsApi.getOne(personId),
    select: (d) => d?.data,
  });

  const { data: txnData, isLoading: txnLoading } = useQuery({
    queryKey: ['transactions', personId, activeTab],
    queryFn: () => transactionsApi.getAll(personId, { status: activeTab }),
    select: (d) => d?.data,
    // Refresh every 60 seconds for live interest amounts
    refetchInterval: 60000,
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

  const { mutate: generateShare, isPending: isSharing } = useMutation({
    mutationFn: () => personsApi.generateShareLink(personId),
    onSuccess: (res) => {
      const url = res.data?.shareUrl || '';
      setShareUrl(url);
      if (navigator.share && /Mobi/i.test(navigator.userAgent)) {
        navigator.share({ title: `${personData?.name}'s ledger on Credit Book`, url }).catch(() => {});
      } else {
        setShareDialogOpen(true);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => toast.success('Link copied!'));
  }

  if (personLoading) return <><PageNavigationBar title="" /><LoadingScreen /></>;

  const person = personData;
  if (!person) return <><PageNavigationBar title="Not Found" /><EmptyState icon="❓" title="Person not found" body="This person may have been deleted." /></>;

  const transactions = txnData?.transactions || [];
  const balance = parseFloat(person.balance) || 0;
  const totalInterestAccrued = parseFloat(person.totalInterestAccrued) || 0;

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
        {/* Share button */}
        <button
          className="nav-page-action"
          onClick={() => generateShare()}
          disabled={isSharing}
          id="person-share-btn"
          title="Share"
          style={{ marginRight: 4, opacity: isSharing ? 0.5 : 1 }}
        >
          {isSharing ? <Spinner size={16} /> : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </button>
        {/* Settings button */}
        <button className="nav-page-action" onClick={() => setOptionsOpen(true)} id="person-options-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Share dialog — desktop only */}
      {shareDialogOpen && (
        <div className="share-dialog-overlay" onClick={() => setShareDialogOpen(false)}>
          <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="share-dialog-header">
              <span className="share-dialog-title">Share Link</span>
              <button className="share-dialog-close" onClick={() => setShareDialogOpen(false)}>✕</button>
            </div>
            <p className="share-dialog-hint">Anyone with this link can view {person.name}'s transaction history (read-only, no login needed).</p>
            <div className="share-dialog-link-row">
              <span className="share-dialog-url">{shareUrl}</span>
              <button className="share-dialog-copy-btn" id="copy-share-link-btn" onClick={handleCopyLink}>Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Card */}
      <BalanceCard
        balance={balance}
        totalInterestAccrued={totalInterestAccrued}
        balanceLabel={balanceLabel}
        balanceClass={balanceClass}
      />

      {/* Tab Switcher — Current | Upcoming | Interest */}
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
        <button
          className={`tab-pill ${activeTab === 'interest' ? 'active interest-tab' : ''}`}
          onClick={() => setActiveTab('interest')}
          id="tab-interest"
        >
          💰 Interest
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
            icon={activeTab === 'upcoming' ? '⏰' : activeTab === 'interest' ? '💰' : '📋'}
            title={
              activeTab === 'upcoming' ? 'No upcoming entries' :
              activeTab === 'interest' ? 'No interest entries' :
              'No entries yet'
            }
            body={
              activeTab === 'upcoming' ? 'Entries with a future date will appear here' :
              activeTab === 'interest' ? 'Add an entry with interest to track it here' :
              'Use the buttons below to add an entry'
            }
          />
        ) : (
          transactions.map((txn, i) => (
            <TransactionCard key={txn.id} txn={txn} index={i} onClick={() => setEditTxn(txn)} />
          ))
        )}
      </div>

      {/* Action Buttons — only on current tab */}
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

      {/* Also show add buttons on interest tab so users can add interest entries */}
      {activeTab === 'interest' && (
        <div className="action-buttons">
          <button className="action-btn action-btn-gave" onClick={() => setAddType('gave')} id="btn-gave-interest">
            + INTEREST ENTRY
          </button>
        </div>
      )}

      {/* Sheets & Dialogs */}
      <AddTransactionSheet
        isOpen={!!addType}
        onClose={() => setAddType(null)}
        personId={personId}
        type={addType || 'gave'}
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
