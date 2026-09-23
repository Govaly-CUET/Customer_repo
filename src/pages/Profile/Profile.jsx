import './Profile.css';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, Heart, MapPin, User, Settings, HelpCircle, LogOut,
  Bell, BadgeCheck, Trash2, ChevronRight, Lock, BellRing, Users, Ticket, Camera,
} from 'lucide-react';
import api, { errMsg } from '../../api.js';
import { useStore } from '../../context/StoreContext.jsx';
import Orders from '../Orders/Orders.jsx';

const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const DISTRICTS = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail'],
  Chattogram: ['Chattogram', 'Cox\'s Bazar', 'Cumilla', 'Noakhali'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Pabna', 'Natore'],
  Khulna: ['Khulna', 'Jashore', 'Kushtia', 'Satkhira'],
  Barishal: ['Barishal', 'Bhola', 'Patuakhali', 'Pirojpur'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Kurigram', 'Nilphamari'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
};

const emptyAddress = { fullName: '', phone: '', division: '', district: '', area: '', address: '', instruction: '', label: 'Home', isDefault: false };
const addressValue = (value, user) => (value && typeof value === 'object' ? { ...emptyAddress, ...value } : { ...emptyAddress, fullName: user?.name || '', phone: user?.phone || '', address: value || '' });

const MENU = [
  [ShoppingCart, 'My Orders', 'orders'],
  [Heart, 'My Wishlist', 'wishlist'],
  [MapPin, 'My Addresses', 'addresses'],
  [User, 'Account Information', 'account'],
  [Settings, 'Setting', 'settings'],
  [HelpCircle, 'Govaly Helpline', 'helpline'],
];

const TITLES = {
  orders: ['My Orders', 'Track and manage your orders'],
  wishlist: ['My Wishlist', 'Your favorite products in one place'],
  addresses: ['My Addresses', 'Addresses you added for shipping'],
  account: ['Account Information', 'Update your profile information'],
  settings: ['Account Settings', 'Manage your account preferences and security settings'],
  helpline: ['Govaly Helpline', 'Get assistance with your orders, account, and more'],
};

/* ---------------- Sections ---------------- */

function AccountSection() {
  const { user, updateUser, toast } = useStore();
  const [edit, setEdit] = useState(false);
  const photoInput = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    gender: user?.gender || '', DOB: user?.DOB ? user.DOB.slice(0, 10) : '',
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await api.patch('/customer/me', form);
      updateUser(data.data);
      setEdit(false);
      toast('Profile updated ✓', 'ok');
    } catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    // Resetting allows the same image to be selected again after a failed upload.
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast('Choose a JPG, PNG, or WEBP image', 'err');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Profile photo must be 5 MB or smaller', 'err');
      return;
    }

    setBusy(true);
    try {
      const payload = new FormData();
      payload.append('image', file);
      const { data } = await api.post('/customer/me/avatar', payload);
      updateUser(data.data);
      toast('Profile photo updated ✓', 'ok');
    } catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
  };

  const profilePhoto = user?.image
    ? <img src={user.image} alt={`${user.name || 'Customer'}'s profile`} />
    : user?.name?.[0]?.toUpperCase();

  const photoControl = (
    <div className="pf-photo-control">
      <div className="pf-avatar-lg">{profilePhoto}</div>
      <input ref={photoInput} className="pf-photo-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} />
      <button className="pf-photo-button" type="button" disabled={busy} onClick={() => photoInput.current?.click()}>
        <Camera size={15} /> {busy ? 'Uploading…' : 'Change photo'}
      </button>
    </div>
  );

  return (
    <>
      {edit ? (
        <div className="panel panel-pad pf-card">
          <div className="pf-account-edit">
            {photoControl}
            <div className="form-grid">
            <div className="field"><label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field"><label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select></div>
            <div className="field"><label>Date of Birth</label>
              <input type="date" value={form.DOB} onChange={(e) => setForm({ ...form, DOB: e.target.value })} /></div>
            <div className="field"><label>Email</label>
              <input value={user?.email || ''} readOnly aria-describedby="email-readonly-note" /></div>
            <small id="email-readonly-note" className="pf-email-note">Your signed-in Gmail cannot be changed.</small>
            </div>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>Save Changes</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="panel panel-pad pf-card pf-info">
          {photoControl}
          <div className="pf-info-grid">
            <div><label>Name</label><p>{user?.name}</p></div>
            <div><label>Phone</label><p>{user?.phone || '--'}</p></div>
            <div><label>Email</label><p>{user?.email}</p><small className="pf-email-note">Signed-in Gmail · cannot be changed</small></div>
            <div><label>Date Of Birth</label><p>{user?.DOB ? new Date(user.DOB).toLocaleDateString() : '--'}</p></div>
            <div><label>Gender</label><p>{user?.gender || 'Prefer not to say'}</p></div>
            <div />
            <button className="btn btn-primary btn-sm" style={{ justifySelf: 'end' }} onClick={() => setEdit(true)}>Edit Profile</button>
          </div>
        </div>
      )}
    </>
  );
}

function AddressesSection() {
  const { user, updateUser, toast } = useStore();
  const initialAddresses = user?.addresses?.length ? user.addresses : (user?.address ? [addressValue(user.address, user)] : []);
  const [savedAddresses, setSavedAddresses] = useState(initialAddresses);
  const [edit, setEdit] = useState(!initialAddresses.length);
  const [address, setAddress] = useState(() => initialAddresses[0] || addressValue(null, user));
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = { ...address, fullName: address.fullName.trim(), phone: address.phone.trim(), address: address.address.trim() };
      const next = [...savedAddresses.filter((item) => item.label !== saved.label), saved];
      if (saved.isDefault) next.forEach((item) => { item.isDefault = item.label === saved.label; });
      const { data } = await api.patch('/customer/me', { address: saved, addresses: next });
      updateUser(data.data);
      setSavedAddresses(next);
      setEdit(false);
      toast('Address saved ✓', 'ok');
    } catch (e2) { toast(errMsg(e2), 'err'); } finally { setBusy(false); }
  };

  return edit ? (
    <form className="panel panel-pad address-form" onSubmit={save}>
      <div className="address-fields">
        <div className="field"><label>Full Name <b>*</b></label><input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} placeholder="Enter your full name" /></div>
        <div className="field"><label>Division</label><select value={address.division} onChange={(e) => setAddress({ ...address, division: e.target.value, district: '' })}><option value="">-- Please choose your division --</option>{DIVISIONS.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label>Phone Number <b>*</b></label><input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="Enter your phone number" /></div>
        <div className="field"><label>City / District <b>*</b></label><select required value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })}><option value="">-- Please choose your district --</option>{(DISTRICTS[address.division] || []).map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label>Address <b>*</b></label><input required value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} placeholder="Building / House No / Floor / Street" /></div>
        <div className="field"><label>Police Station / Upazila</label><input value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} placeholder="Enter your area" /></div>
        <div className="field address-wide"><label>Additional Instruction</label><input value={address.instruction} onChange={(e) => setAddress({ ...address, instruction: e.target.value })} placeholder="Enter additional instruction for the address (optional)" /></div>
      </div>
      <div className="address-label"><span>Select a label for effective delivery:</span><button type="button" className={address.label === 'Home' ? 'selected' : ''} onClick={() => setAddress({ ...address, label: 'Home' })}>⌂ Home</button><button type="button" className={address.label === 'Office' ? 'selected' : ''} onClick={() => setAddress({ ...address, label: 'Office' })}>▣ Office</button><label><input type="checkbox" checked={address.isDefault} onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })} /> Make it default address</label></div>
      <div className="row address-actions"><button className="btn btn-primary" disabled={busy}>Save</button>{savedAddresses.length > 0 && <button type="button" className="btn btn-outline" onClick={() => setEdit(false)}>Cancel</button>}</div>
    </form>
  ) : (
    <div>
      {savedAddresses.map((item) => (
        <div className="panel panel-pad address-summary" key={item.label} style={{ marginBottom: 10 }}>
          <div><b>{item.label || 'Home'} · {item.fullName}</b><p>{[item.address, item.area, item.district, item.division].filter(Boolean).join(', ')}</p><small>{item.phone}</small></div>
          <button className="btn btn-outline btn-sm" onClick={() => { setAddress({ ...addressValue(item, user) }); setEdit(true); }}>Edit</button>
        </div>
      ))}
      <button className="btn btn-primary btn-sm" onClick={() => { setAddress(addressValue(null, user)); setEdit(true); }}>+ Add another address</button>
    </div>
  );
}

function SettingsSection() {
  const { toast, setPassword, changePassword, user } = useStore();
  const hasPassword = Boolean(user?.hasPassword);
  const [openPw, setOpenPw] = useState(false);
  const [notif, setNotif] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { try { setNotif(Notification.permission === 'granted'); } catch { /* noop */ } }, []);

  const allowNotif = async () => {
    try {
      const p = await Notification.requestPermission();
      setNotif(p === 'granted');
      toast(p === 'granted' ? 'Notifications enabled ✓' : 'Notifications blocked in this browser', p === 'granted' ? 'ok' : 'err');
    } catch { toast('Notifications not supported here', 'err'); }
  };

  return (
    <>
      <div className="panel panel-pad" style={{ marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <span className="help-ic" style={{ background: '#fde7f1' }}><BellRing size={18} color="var(--brand)" /></span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 14.5 }}>Browser notifications</b>
          <div className="mut" style={{ fontSize: 12.5 }}>This browser</div>
          <div className="mut" style={{ fontSize: 12.5 }}>
            {notif ? 'You are subscribed to order updates.' : 'Get order status and deal alerts.'}{' '}
            {!notif && <button className="link-brand" style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: 12.5 }} onClick={allowNotif}>Allow in browser</button>}
          </div>
        </div>
        <button
          className={`switch${notif ? ' on' : ''}`}
          role="switch" aria-checked={notif} aria-label="Browser notifications"
          onClick={() => (notif ? toast('Toggle from your browser permission', 'err') : allowNotif())}
        ><span /></button>
      </div>

      <div className="panel panel-pad" style={{ padding: 0 }}>
        <button className="pf-rowbtn" onClick={() => setOpenPw(!openPw)} style={{ width: '100%' }}>
          <span className="help-ic" style={{ background: '#fde7f1' }}><Lock size={18} color="var(--brand)" /></span>
          <span style={{ flex: 1, textAlign: 'left' }}>
            <b style={{ fontSize: 14.5, display: 'block' }}>{hasPassword ? 'Change Password' : 'Set Password'}</b>
            <span className="mut" style={{ fontSize: 12.5 }}>
              {hasPassword ? 'Update your account password for better security' : 'Create a password for your account'}
            </span>
          </span>
          <ChevronRight size={17} className={openPw ? 'rot90' : ''} />
        </button>
        {openPw && (
          <div style={{ padding: '4px 18px 18px' }}>
            <div className="form-grid">
              {hasPassword && (
                <div className="field"><label>Current password</label>
                  <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
              )}
              <div className="field"><label>{hasPassword ? 'New password (min 6)' : 'Password (min 6)'}</label>
                <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
              <div className="field"><label>Confirm new password</label>
                <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
            </div>
            <button
              className="btn btn-primary btn-sm" style={{ marginTop: 10 }}
              disabled={busy || (hasPassword && !pw.current) || !pw.next || !pw.confirm}
              onClick={async () => {
                if (pw.next !== pw.confirm) return toast('New passwords do not match', 'err');
                setBusy(true);
                try {
                  if (hasPassword) {
                    await changePassword(pw.current, pw.next, pw.confirm);
                  } else {
                    await setPassword(pw.next, pw.confirm);
                  }
                  setPw({ current: '', next: '', confirm: '' });
                  setOpenPw(false);
                }
                catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
              }}
            >{busy ? (hasPassword ? 'Updating…' : 'Saving…') : (hasPassword ? 'Update Password' : 'Save Password')}</button>
          </div>
        )}
      </div>
    </>
  );
}

function HelplineSection() {
  return (
    <>
      <a className="panel pf-rowbtn" style={{ background: '#eef7ee', marginBottom: 10 }} href="https://wa.me/8801907104920" target="_blank" rel="noopener noreferrer">
        <span className="help-ic" style={{ background: '#25d366' }}>💬</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Chat in Whatsapp</span>
        <ChevronRight size={17} />
      </a>
      <a className="panel pf-rowbtn" style={{ marginBottom: 10 }} href="tel:+8801969901212">
        <span className="help-ic" style={{ background: '#fde7f1' }}>📞</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Direct Support</span>
        <b style={{ fontSize: 13 }}>Hotline: 8801969901212</b>
      </a>
      <Link className="panel pf-rowbtn" style={{ marginBottom: 10 }} to="/chat">
        <span className="help-ic" style={{ background: '#e7f0fd' }}><Ticket size={17} color="#2563eb" /></span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Ticket Support</span>
        <ChevronRight size={17} />
      </Link>
      <Link className="panel pf-rowbtn" style={{ marginBottom: 10 }} to="/faq">
        <span className="help-ic" style={{ background: '#fef3e2' }}>❓</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>FAQ</span>
        <ChevronRight size={17} />
      </Link>
      <div className="panel pf-rowbtn" style={{ width: '100%' }}>
        <span className="help-ic" style={{ background: '#fde7f1' }}><Users size={17} color="var(--brand)" /></span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Community</span>
        <a
          className="btn btn-outline btn-sm"
          href="https://facebook.com/groups/govaly"
          target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >Visit Community Group</a>
      </div>
    </>
  );
}

function WishlistSection() {
  const { wishlist, toggleWishlist, addToCart, toast } = useStore();
  if (!wishlist.length) return <div className="panel pf-empty">Your wishlist is empty — tap the ♥ on any product to save it here.</div>;
  return (
    <div className="panel" style={{ padding: '4px 0' }}>
      {wishlist.map((p) => {
        return (
          <div className="wl-row" key={p._id}>
            <Link to={`/product/${p.slug}`}><img src={p.images?.[0]} alt={p.name} className="wl-thumb" /></Link>
            <Link to={`/product/${p.slug}`} className="wl-name">{p.name}</Link>
            <div className="wl-price">
              <b>৳{p.price}</b>
            </div>
            <button className="trash" onClick={() => toggleWishlist(p)} aria-label="Remove"><Trash2 size={16} /></button>
            <button className="btn btn-primary btn-sm" onClick={() => { addToCart(p, null, 1, true); toast('Added to cart 🛍️', 'ok'); }}>Add to Cart</button>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Layout ---------------- */

export default function Profile() {
  const { user, logout } = useStore();
  const { section = 'account' } = useParams();
  const nav = useNavigate();
  if (!user) return null;
  const [title, sub] = TITLES[section] || TITLES.account;

  return (
    <div className="container pf-grid">
      {/* Sidebar — Govaly structure */}
      <aside className="pf-side">
        <div className="pf-side-top">
          <div className="pf-avatar">{user.image ? <img src={user.image} alt="" /> : user.name?.[0]?.toUpperCase()}</div>
          <div className="pf-id">
            <b style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{user.name} <BadgeCheck size={13} color="#1d9bf0" /></b>
          </div>
          <Bell size={17} color="var(--ink-2)" style={{ marginLeft: 'auto' }} />
        </div>
        <nav className="pf-menu">
          {MENU.map(([Ic, label, key]) => (
            <Link key={key} to={`/profile/${key}`} className={`pf-item${section === key ? ' pf-active' : ''}`}>
              <Ic size={16} /> {label}
            </Link>
          ))}

          <button className="pf-item pf-out" onClick={() => { logout(); nav('/'); }}>
            <LogOut size={16} /> Log Out
          </button>
        </nav>
      </aside>

      {/* Content */}
      <section className="pf-main">
        <div className="pf-heading">
          <h2 style={{ margin: 0 }}>{title}</h2>
          <p className="mut" style={{ margin: '2px 0 0' }}>{sub}</p>
        </div>

        {section === 'orders' && <Orders embedded />}
        {section === 'wishlist' && <WishlistSection />}
        {section === 'addresses' && <AddressesSection />}
        {(section === 'account' || !TITLES[section]) && <AccountSection />}
        {section === 'settings' && <SettingsSection />}
        {section === 'helpline' && <HelplineSection />}
      </section>
    </div>
  );
}
