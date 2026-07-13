// Credit Book — Persons Routes
const router = require('express').Router();
const personsService = require('../services/persons.service');
const txnService = require('../services/transactions.service');
const { authMiddleware } = require('../middleware/auth');
const { successResponse } = require('../utils/response');

// Shared entries (view-only — others' persons linked to this user)
router.get('/shared', authMiddleware, async (req, res, next) => {
  try {
    const result = await personsService.getSharedPersons(req.user.id);
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

// My persons list
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await personsService.getPersons(req.user.id, req.query);
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

// Create person
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const person = await personsService.createPerson(req.user.id, req.body);
    res.status(201).json(successResponse(person));
  } catch (err) { next(err); }
});

// Get single person
router.get('/:personId', authMiddleware, async (req, res, next) => {
  try {
    const person = await personsService.getPerson(req.params.personId, req.user.id);
    res.json(successResponse(person));
  } catch (err) { next(err); }
});

// Update person
router.patch('/:personId', authMiddleware, async (req, res, next) => {
  try {
    const person = await personsService.updatePerson(req.params.personId, req.user.id, req.body);
    res.json(successResponse(person));
  } catch (err) { next(err); }
});

// Schedule delete (24h)
router.delete('/:personId', authMiddleware, async (req, res, next) => {
  try {
    const result = await personsService.scheduleDeletion(req.params.personId, req.user.id);
    res.json(successResponse(result, 'Person scheduled for deletion in 24 hours'));
  } catch (err) { next(err); }
});

// Restore (undo delete)
router.post('/:personId/restore', authMiddleware, async (req, res, next) => {
  try {
    await personsService.restorePerson(req.params.personId, req.user.id);
    res.json(successResponse(null, 'Deletion cancelled'));
  } catch (err) { next(err); }
});

// ─── Transactions nested under persons ────────────────────────────────────
router.get('/:personId/transactions', authMiddleware, async (req, res, next) => {
  try {
    const result = await txnService.getTransactions(req.params.personId, req.user.id, req.query);
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

router.post('/:personId/transactions', authMiddleware, async (req, res, next) => {
  try {
    const txn = await txnService.createTransaction(req.params.personId, req.user.id, req.body);
    res.status(201).json(successResponse(txn));
  } catch (err) { next(err); }
});

router.patch('/:personId/transactions/:txnId', authMiddleware, async (req, res, next) => {
  try {
    const txn = await txnService.updateTransaction(req.params.personId, req.params.txnId, req.user.id, req.body);
    res.json(successResponse(txn));
  } catch (err) { next(err); }
});

router.delete('/:personId/transactions/:txnId', authMiddleware, async (req, res, next) => {
  try {
    await txnService.deleteTransaction(req.params.personId, req.params.txnId, req.user.id);
    res.json(successResponse(null, 'Transaction deleted'));
  } catch (err) { next(err); }
});

router.get('/:personId/transactions/:txnId/interest-history', authMiddleware, async (req, res, next) => {
  try {
    const history = await txnService.getInterestHistory(req.params.txnId);
    res.json(successResponse(history));
  } catch (err) { next(err); }
});

// ─── Share link (generate / revoke) ────────────────────────────────────────
router.post('/:personId/share', authMiddleware, async (req, res, next) => {
  try {
    const token = await personsService.generateShareToken(req.params.personId, req.user.id);
    const shareUrl = `${process.env.CLIENT_URL || 'https://creditbook5.vercel.app'}/share/${token}`;
    res.json(successResponse({ token, shareUrl }));
  } catch (err) { next(err); }
});

router.delete('/:personId/share', authMiddleware, async (req, res, next) => {
  try {
    await personsService.revokeShareToken(req.params.personId, req.user.id);
    res.json(successResponse(null, 'Share link revoked'));
  } catch (err) { next(err); }
});

module.exports = router;
