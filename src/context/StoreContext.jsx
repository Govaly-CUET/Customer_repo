import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import storage from '../storage.js';
import { normalizeProduct } from '../adapters.js';

const StoreContext = createContext(null);

// Cart line shape:
// { product, itemId, slug, name, image, seller, color, size, qty, price, stock }
function normalizeCartLine(line) {
  const p = line.product || {};

  return {
    itemId: line.itemId,
    product: p._id,
    slug: p.slug,
    name: p.name,
    image: p.images?.[0] || p.image || '',
    seller: p.seller?.shopSlug || '',
    sellerName: p.seller?.shopName || '',
    color: line.color || '',
    size: line.size || '',
    qty: line.quantity,
    price: p.sale_price ?? p.price ?? 0,
    stock: p.stock ?? 50,
  };
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);

  const nav = useNavigate();
  const loc = useLocation();

  const pathRef = useRef('/');
  pathRef.current = loc.pathname;

  const [booting, setBooting] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [media, setMedia] = useState({});
  const [toasts, setToasts] = useState([]);

  // ---------------------------------------------------------------------------
  // TOAST
  // ---------------------------------------------------------------------------

  const toast = useCallback((message, kind = 'brand') => {
    const id = Math.random().toString(36).slice(2);

    setToasts((t) => [
      ...t,
      {
        id,
        message,
        kind,
      },
    ]);

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  // ---------------------------------------------------------------------------
  // CART + WISHLIST LOADING
  // ---------------------------------------------------------------------------

  const loadCartAndWishlist = useCallback(async () => {
    try {
      const [cartRes, wlRes] = await Promise.all([
        api.get('/customer/cart'),
        api.get('/customer/wishlist'),
      ]);

      setCart(
        (cartRes.data.data || []).map(normalizeCartLine)
      );

      setWishlist(
        (wlRes.data.data || []).map(normalizeProduct)
      );
    } catch {
      // User may not be logged in.
      setCart([]);
      setWishlist([]);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // LOAD MEDIA
  // ---------------------------------------------------------------------------

  useEffect(() => {
    api
      .get('/customer/media')
      .then(({ data }) => {
        setMedia(
          Object.fromEntries(
            (data.data || []).map((item) => [
              item.title.toLowerCase(),
              item,
            ])
          )
        );
      })
      .catch(() => {});
  }, []);

  // ---------------------------------------------------------------------------
  // RESTORE CUSTOMER SESSION
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (storage.get('govaly_token')) {
        try {
          const { data } = await api.get('/customer/me');

          if (!mounted) return;

          setUser(data.data);
          await loadCartAndWishlist();
        } catch {
          storage.remove('govaly_token');

          if (mounted) {
            setUser(null);
            setCart([]);
            setWishlist([]);
          }
        }
      }

      if (mounted) {
        setBooting(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadCartAndWishlist]);

  // ---------------------------------------------------------------------------
  // GLOBAL LOGOUT
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onLogout = (event) => {
      setUser(null);
      setCart([]);
      setWishlist([]);

      if (event.detail?.reason === 'manual') {
        toast('Logged out', 'ok');
        return;
      }

      toast(
        'Session expired — please login again',
        'err'
      );

      /*
       * IMPORTANT:
       * We are moving authentication to a modal.
       *
       * Do NOT navigate to /login here.
       *
       * The Auth modal can listen for the logout event later.
       */
    };

    window.addEventListener(
      'govaly:logout',
      onLogout
    );

    return () => {
      window.removeEventListener(
        'govaly:logout',
        onLogout
      );
    };
  }, [toast]);

  // ===========================================================================
  // AUTHENTICATION
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // PASSWORD LOGIN
  // ---------------------------------------------------------------------------

  const login = async (email, password) => {
    try {
      const { data } = await api.post(
        '/customer/auth/login/password',
        {
          email,
          password,
        }
      );

      storage.set(
        'govaly_token',
        data.token
      );

      setUser(data.data);

      await loadCartAndWishlist();

      const firstName =
        data.data?.name?.trim()?.split(' ')[0] ||
        'there';

      toast(
        `Welcome back, ${firstName}! 👋`,
        'ok'
      );

      return data.data;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const { data } = await api.post(
        '/customer/auth/google',
        {
          credential,
        }
      );

      if (!data.token) {
        throw new Error('Google authentication succeeded but no token was returned.');
      }

      storage.set('govaly_token', data.token);
      setUser(data.data);
      await loadCartAndWishlist();

      const firstName =
        data.data?.name?.trim()?.split(' ')[0] ||
        'there';

      toast(
        `Welcome, ${firstName}! 👋`,
        'ok'
      );

      return data.data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // REGISTER — LEGACY REQUEST OTP ALIAS
  // ---------------------------------------------------------------------------

  const register = async (email) => {
    return requestRegisterOtp(email);
  };

  // ---------------------------------------------------------------------------
  // REGISTER — REQUEST OTP
  // ---------------------------------------------------------------------------

  const requestRegisterOtp = async (email) => {
    try {
      const { data } = await api.post(
        '/customer/auth/register/request-otp',
        {
          email,
        }
      );

      return data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // REGISTER — VERIFY OTP
  // ---------------------------------------------------------------------------

  const verifyRegisterOtp = async (
    email,
    otp
  ) => {
    try {
      const { data } = await api.post(
        '/customer/auth/register/verify-otp',
        {
          email,
          otp,
        }
      );

      /*
       * Depending on the backend response, this may contain:
       *
       * token
       * user
       *
       * If a token is returned, save it.
       */

      if (!data.token || !data.user) {
        throw new Error(
          'Registration succeeded but no authentication session was returned.'
        );
      }

      storage.set('govaly_token', data.token);
      setUser(data.user);
      await loadCartAndWishlist();

      return data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // LOGIN — REQUEST OTP
  // ---------------------------------------------------------------------------

  const requestLoginOtp = async (email) => {
    try {
      const { data } = await api.post(
        '/customer/auth/login/request-otp',
        {
          email,
        }
      );

      return data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // LOGIN — VERIFY OTP
  // ---------------------------------------------------------------------------

  const verifyLoginOtp = async (
    email,
    otp
  ) => {
    try {
      const { data } = await api.post(
        '/customer/auth/login/verify-otp',
        {
          email,
          otp,
        }
      );

      if (!data.token) {
        throw new Error(
          'Login successful but no authentication token was returned.'
        );
      }

      storage.set(
        'govaly_token',
        data.token
      );

      setUser(data.data);

      await loadCartAndWishlist();

      const firstName =
        data.data?.name?.trim()?.split(' ')[0] ||
        'there';

      toast(
        `Welcome back, ${firstName}! 👋`,
        'ok'
      );

      return data.data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // SET PASSWORD
  // ---------------------------------------------------------------------------
  //
  // Used after registration when the account currently has no password.
  //
  // PATCH /customer/auth/set-password
  //
  // Requires JWT returned after registration OTP verification.
  //

  const setPassword = async (password, confirmPassword = password) => {
    try {
      const { data } = await api.patch(
        '/customer/auth/set-password',
        {
          password,
          confirmPassword,
        }
      );

      if (data.data) {
        setUser(data.data);
      }

      toast(
        'Password saved successfully ✓',
        'ok'
      );

      return data.data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // CHANGE EXISTING PASSWORD
  // ---------------------------------------------------------------------------

  const changePassword = async (
    currentPassword,
    newPassword,
    confirmPassword = newPassword
  ) => {
    try {
      await api.patch(
        '/customer/change-password',
        {
          currentPassword,
          newPassword,
          confirmPassword,
        }
      );

      toast(
        'Password changed ✓',
        'ok'
      );
    } catch (error) {
      throw error;
    }
  };

  // ===========================================================================
  // FORGOT PASSWORD
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // REQUEST FORGOT PASSWORD OTP
  // ---------------------------------------------------------------------------

  const requestForgotPasswordOtp = async (
    email
  ) => {
    try {
      const { data } = await api.post(
        '/customer/auth/forgot-password/request-otp',
        {
          email,
        }
      );

      return data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // VERIFY FORGOT PASSWORD OTP
  // ---------------------------------------------------------------------------

  const verifyForgotPasswordOtp = async (
    email,
    otp
  ) => {
    try {
      const { data } = await api.post(
        '/customer/auth/forgot-password/verify-otp',
        {
          email,
          otp,
        }
      );

      /*
       * Backend returns a temporary reset token.
       *
       * The Auth modal will keep this token and use it
       * when the user creates the new password.
       */

      return data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // RESET PASSWORD
  // ---------------------------------------------------------------------------

  const resetPassword = async (
    email,
    token,
    password,
    confirmPassword = password
  ) => {
    try {
      const { data } = await api.post(
        '/customer/auth/reset-password',
        {
          email,
          resetToken: token,
          password,
          confirmPassword,
        }
      );

      if (data.token) {
        storage.set('govaly_token', data.token);
      }

      if (data.data) {
        setUser(data.data);
        await loadCartAndWishlist();
      }

      toast(
        'Password reset successfully ✓',
        'ok'
      );

      return data;
    } catch (error) {
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------------------------

  const logout = () => {
    storage.remove('govaly_token');
    window.dispatchEvent(
      new CustomEvent('govaly:logout', {
        detail: { reason: 'manual' },
      })
    );

    setUser(null);
    setCart([]);
    setWishlist([]);

    toast('Logged out', 'ok');
  };

  // ===========================================================================
  // CART
  // ===========================================================================

  const addToCart = async (
    product,
    size = null,
    qty = 1,
    silent = false,
    color = null
  ) => {
    if (!user) {
      toast(
        'Please login to add items to your cart',
        'err'
      );

      /*
       * Authentication is now modal-based.
       *
       * Dispatch an event so the Auth component can open
       * the modal without navigating away from the current page.
       */

      window.dispatchEvent(
        new CustomEvent('govaly:open-auth', {
          detail: {
            mode: 'login',
            from: pathRef.current,
          },
        })
      );

      return;
    }

    try {
      const pick = size || '';
      const col = color || '';

      const { data } = await api.post(
        '/customer/cart',
        {
          productId: product._id,
          quantity: qty,
          size: pick,
          color: col,
        }
      );

      setCart(
        (data.data || []).map(normalizeCartLine)
      );

      if (!silent) {
        toast(
          'Added to cart 🛍️',
          'ok'
        );
      }
    } catch (e) {
      toast(
        errMsg(
          e,
          'Could not add to cart'
        ),
        'err'
      );
    }
  };

  const setQty = async (
    productId,
    size,
    qty,
    color = ''
  ) => {
    const line = cart.find(
      (x) => x.product === productId
    );

    if (!line) return;

    try {
      const { data } = await api.patch(
        `/customer/cart/${line.itemId}`,
        {
          quantity: qty,
        }
      );

      setCart(
        (data.data || []).map(normalizeCartLine)
      );
    } catch (e) {
      toast(
        errMsg(
          e,
          'Could not update quantity'
        ),
        'err'
      );
    }
  };

  const removeFromCart = async (
    productId,
    size,
    color = ''
  ) => {
    const line = cart.find(
      (x) => x.product === productId
    );

    if (!line) return false;

    try {
      const { data } = await api.delete(
        `/customer/cart/${line.itemId}`
      );

      setCart(
        (data.data || []).map(normalizeCartLine)
      );

      toast(
        'Removed from cart'
      );

      return true;
    } catch (e) {
      toast(
        errMsg(
          e,
          'Could not remove item'
        ),
        'err'
      );

      return false;
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // ===========================================================================
  // WISHLIST
  // ===========================================================================

  const toggleWishlist = async (product) => {
    if (!user) {
      toast(
        'Please login to save items to your wishlist',
        'err'
      );

      window.dispatchEvent(
        new CustomEvent('govaly:open-auth', {
          detail: {
            mode: 'login',
            from: pathRef.current,
          },
        })
      );

      return;
    }

    const already = wishlist.some(
      (w) => w._id === product._id
    );

    try {
      const { data } = already
        ? await api.delete(
            `/customer/wishlist/${product._id}`
          )
        : await api.post(
            `/customer/wishlist/${product._id}`
          );

      setWishlist(
        (data.data || []).map(normalizeProduct)
      );

      toast(
        already
          ? 'Removed from wishlist'
          : 'Saved to wishlist ❤️',
        already ? undefined : 'ok'
      );
    } catch (e) {
      toast(
        errMsg(
          e,
          'Could not update wishlist'
        ),
        'err'
      );
    }
  };

  const isWishlisted = (id) =>
    wishlist.some(
      (w) => w._id === id
    );

  // ===========================================================================
  // COUNTS
  // ===========================================================================

  const counts = useMemo(
    () => ({
      cartQty: cart.reduce(
        (s, i) => s + i.qty,
        0
      ),

      cartSubtotal: cart.reduce(
        (s, i) => s + i.price * i.qty,
        0
      ),
    }),
    [cart]
  );

  // ===========================================================================
  // CONTEXT VALUE
  // ===========================================================================

  const value = {
    // User/session
    user,
    booting,
    media,

    // Authentication
    login,
    loginWithGoogle,
    logout,
    register,

    requestRegisterOtp,
    verifyRegisterOtp,

    requestLoginOtp,
    verifyLoginOtp,

    setPassword,

    changePassword,

    requestForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,

    updateUser: setUser,

    // Cart
    cart,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,

    // Wishlist
    wishlist,
    toggleWishlist,
    isWishlisted,

    // Toast
    toasts,
    toast,

    // Counts
    ...counts,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () =>
  useContext(StoreContext);