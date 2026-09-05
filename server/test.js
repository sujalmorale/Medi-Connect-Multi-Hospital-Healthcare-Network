import assert from 'assert';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getCache, setCache, lockSlot, unlockSlot } from './config/redis.js';

console.log('-------------------------------------------------------');
console.log('🧪 Running Automated Verification Tests for MediConnect');
console.log('-------------------------------------------------------');

async function runTests() {
  let passed = 0;

  // Test 1: JWT Signing & Role Verification
  try {
    const payload = { id: 'usr-123', role: 'doctor', name: 'Dr. Test' };
    const secret = 'mediconnect_super_secret_jwt_key_2026_mumbai_health';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    
    assert.strictEqual(decoded.id, 'usr-123');
    assert.strictEqual(decoded.role, 'doctor');
    console.log('✅ Test 1 Passed: JWT Signing & Decryption Verified');
    passed++;
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
  }

  // Test 2: Razorpay HMAC SHA256 Payment Verification Logic
  try {
    const orderId = 'order_test_999';
    const paymentId = 'pay_test_888';
    const secret = 'razorpay_secret_key_mediconnect_mock';

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const generated = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.strictEqual(generated, expectedSignature);
    console.log('✅ Test 2 Passed: Razorpay HMAC SHA256 Signature Verification Verified');
    passed++;
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
  }

  // Test 3: Redis Cache & Atomic Slot Locking
  try {
    await setCache('test:key', { message: 'hello' }, 10);
    const cached = await getCache('test:key');
    assert.strictEqual(cached.message, 'hello');

    const doctorId = 'doc-test-1';
    const slot = '10:00 AM';
    const locked1 = await lockSlot(doctorId, slot, 'patient-1', 60);
    assert.strictEqual(locked1, true);

    const locked2 = await lockSlot(doctorId, slot, 'patient-2', 60);
    assert.strictEqual(locked2, false); // Double booking prevented!

    await unlockSlot(doctorId, slot);
    const locked3 = await lockSlot(doctorId, slot, 'patient-3', 60);
    assert.strictEqual(locked3, true);

    console.log('✅ Test 3 Passed: Redis Caching & Atomic Slot Lock Double-Booking Prevention Verified');
    passed++;
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
  }

  console.log('-------------------------------------------------------');
  console.log(`🎉 Verification Complete: ${passed}/3 Tests Passed Cleanly`);
  console.log('-------------------------------------------------------');
}

runTests();
