// Credit Book — Public Share Page (no login required)
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api';
import { formatCurrency, formatDate, getInitials } from '../../utils';
import './SharePage.css';

function Avatar({ name, color, size = 40 }) {
  return (
    <div className="share-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}>
      {getInitials(name)}
    </div>
  );
}

export default function SharePage() {
  const { token } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-share', token],
    queryFn: () => publicApi.getShare(token),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="share-page">
        <div className="share-loading">
          <div className="share-spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="share-page">
        <div className="share-error">
          <div className="share-error-icon">🔗</div>
          <h2>Link not found</h2>
          <p>This share link is invalid or has been revoked.</p>
        </div>
      </div>
    );
  }

  const { person, transactions } = data.data;
  const balance = parseFloat(person.balance) || 0;
  const balanceLabel = balance > 0 ? 'Will receive' : balance < 0 ? 'Will pay' : 'Settled up';
  const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero';

  return (
    <div className="share-page">
      {/* Header */}
      <div className="share-header">
        <div className="share-logo">
          <img src="/logo.jpg" alt="Credit Book" className="share-logo-img" />
          <span className="share-logo-text">Credit Book</span>
        </div>
        <div className="share-badge">View Only</div>
      </div>

      {/* Person Card */}
      <div className="share-person-card">
        <Avatar name={person.name} color={person.avatarColor} size={56} />
        <div className="share-person-info">
          <h1 className="share-person-name">{person.name}</h1>
          {person.ownerName && (
            <p className="share-person-owner">Shared by {person.ownerName}</p>
          )}
        </div>
        <div className={`share-balance-chip ${balanceClass}`}>
          <span className="share-balance-label">{balanceLabel}</span>
          <span className="share-balance-amount">{formatCurrency(Math.abs(balance))}</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="share-txn-section">
        <h2 className="share-section-title">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="share-empty">
            <span>📋</span>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="share-txn-list">
            {transactions.map((txn) => {
              const isGot = txn.type === 'got';
              const interestAccrued = txn.currentAmount - txn.amount;
              return (
                <div key={txn.id} className="share-txn-card">
                  <div className="share-txn-top">
                    <div className="share-txn-left">
                      <span className={`share-txn-type ${txn.type}`}>
                        {isGot ? 'You Got' : 'You Gave'}
                      </span>
                      {txn.description && (
                        <span className="share-txn-desc">{txn.description}</span>
                      )}
                    </div>
                    <div className="share-txn-right">
                      <span className={`share-txn-amount ${txn.type}`}>
                        {isGot ? '+' : '-'}{formatCurrency(txn.currentAmount)}
                      </span>
                      {txn.interestRate && (
                        <span className="share-txn-interest">{txn.interestRate}% p.a.</span>
                      )}
                    </div>
                  </div>
                  <div className="share-txn-meta">
                    <span className="share-txn-date">{formatDate(txn.transactionDate)}</span>
                    {txn.balanceAfter !== undefined && (
                      <span className="share-txn-bal">Bal: {formatCurrency(Math.abs(txn.balanceAfter))}</span>
                    )}
                  </div>
                  {txn.interestRate && interestAccrued > 0.01 && (
                    <div className="share-txn-interest-note">
                      +{formatCurrency(interestAccrued)} interest accrued
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="share-footer">
        <p>Powered by <strong>Credit Book</strong> · Track money easily</p>
        <a href="https://creditbook5.vercel.app" className="share-footer-link">Open App →</a>
      </div>
    </div>
  );
}
