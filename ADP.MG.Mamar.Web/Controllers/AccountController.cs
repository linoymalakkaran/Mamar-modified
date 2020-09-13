using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using ADP.MG.Mamar.Web.Models;
using ApiHelper;
using ADP.MG.Mamar.Web.ApiInfrastructure;
using Newtonsoft.Json.Linq;
using ApiHelper.Client;
using ADP.MG.Mamar.Web.ApiInfrastructure.Client;
using System.Configuration;
using ApiHelper.Response;
using Newtonsoft.Json;
using ADP.MG.Pcs.Models.CustomModels.Subscription;

namespace ADP.MG.Mamar.Web.Controllers
{
    public class AccountController : Controller
    {
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;
        public AccountController()
        {

        }

        public AccountController(ApplicationUserManager userManager, ApplicationSignInManager signInManager )
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set 
            { 
                _signInManager = value; 
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string message)
        {
            //sso patch
            if (User == null || User.Identity == null || !User.Identity.IsAuthenticated)
            {
                if (Convert.ToBoolean(ConfigurationManager.AppSettings["EnabledSSO"] != null ? ConfigurationManager.AppSettings["EnabledSSO"] : "false"))
                    return Redirect(ConfigurationManager.AppSettings["SSOURL"]);
            }

            ViewBag.ForgotPasswordLink= ConfigurationManager.AppSettings["DefaultURL"] + "/Account/ForgotPassword?isMamarUser=true";
            TempData["Message"] = message;
            TempData["ApiURL"] = ConfigurationManager.AppSettings["MamarAppSysPublicApiURL"];
            TempData["MGSurveyApiURL"] = ConfigurationManager.AppSettings["MGSurveyApiURL"];
            TempData["MGSurveyAppName"] = ConfigurationManager.AppSettings["MGSurveyAppName"];
            TempData["MGSurveyAppKey"] = ConfigurationManager.AppSettings["MGSurveyAppKey"];
            //ViewBag.MamarBaseURL= ConfigurationManager.AppSettings["MamarBaseUrl"];
            ViewBag.EnableSubscriptionFee = ConfigurationManager.AppSettings["EnableMamarSubscriptionFee"];
            ViewBag.UnifiedRegistrationUrl = ConfigurationManager.AppSettings["DefaultURL"] + "/UnifiedRegistration/CustomerRegistration/Index?isMamarUser=true";
            
            return View();
        }

        //
        // POST: /Account/Login
        [HttpPost]
        public async Task<ActionResult> Login(LoginViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return View(model);
				
					HttpCookie cookie = new HttpCookie("MAQTA-LOCAL-TOKEN", model.Token);
					cookie.HttpOnly = true;
					cookie.Path += ";SameSite=Strict";
					Response.Cookies.Add(cookie);
	
                    var identity = new ClaimsIdentity(
                        new[] { new Claim(ClaimTypes.Name, model.UserName) },
                        DefaultAuthenticationTypes.ApplicationCookie);

                    AuthenticationManager.SignIn(new AuthenticationProperties
                    {
                        IsPersistent = model.RememberMe,
                    }, identity);

                    return Json(new { Success = true, UserName = model.UserName, Token = "", ApiURL= ConfigurationManager.AppSettings["MamarAppSysPublicApiURL"] });
                
            }
            catch (Exception ex)
            {
                CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
                throw ex;
            }
        }
        public async Task<ActionResult> GetSubscriptionData()
        {
            string EnableSubscriptionFee = ConfigurationManager.AppSettings["EnableMamarSubscriptionFee"];
            if (!string.IsNullOrEmpty(EnableSubscriptionFee) && EnableSubscriptionFee != "__EnableMamarSubscriptionFee__" && Convert.ToBoolean(EnableSubscriptionFee))
            {
                string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
                if (token == null)
                {
                    return Json(new
                    {
                        redirectUrl = Url.Action("LogOff", "Account"),
                        isRedirect = true
                    }, JsonRequestBehavior.AllowGet);
                }
                ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpSubscriptionClient.Instance, token);
                GenericClient cb = new GenericClient(client);
                var response = await cb.Get("subscription/SubscriptionStatus");
                var objSubscription = JsonConvert.DeserializeObject<SubscriptionStatusResponse>(response.ResponseResult);
                if (objSubscription.isRestricted)
                {
                    return Json(new ApiResponse() { StatusIsSuccessful = false, ResponseResult = "Subscription Disabled" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(response, JsonRequestBehavior.AllowGet);
                }
            }
            else {
                return Json(new ApiResponse() { StatusIsSuccessful = false, ResponseResult = "Subscription Disabled" },JsonRequestBehavior.AllowGet);
            }
        }

       
    //
    // GET: /Account/VerifyCode
    [AllowAnonymous]
        public async Task<ActionResult> VerifyCode(string provider, string returnUrl, bool rememberMe)
        {
            // Require that the user has already logged in via username/password or external login
            if (!await SignInManager.HasBeenVerifiedAsync())
            {
                return View("Error");
            }
            return View(new VerifyCodeViewModel { Provider = provider, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/VerifyCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> VerifyCode(VerifyCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // The following code protects for brute force attacks against the two factor codes. 
            // If a user enters incorrect codes for a specified amount of time then the user account 
            // will be locked out for a specified amount of time. 
            // You can configure the account lockout settings in IdentityConfig
            var result = await SignInManager.TwoFactorSignInAsync(model.Provider, model.Code, isPersistent:  model.RememberMe, rememberBrowser: model.RememberBrowser);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(model.ReturnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.Failure:
                default:
                    ModelState.AddModelError("", "Invalid code.");
                    return View(model);
            }
        }

        //
        // GET: /Account/Register
        [AllowAnonymous]
        public ActionResult Register()
        {
            return View();
        }

        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
                var result = await UserManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {
                    await SignInManager.SignInAsync(user, isPersistent:false, rememberBrowser:false);
                    
                    // For more information on how to enable account confirmation and password reset please visit http://go.microsoft.com/fwlink/?LinkID=320771
                    // Send an email with this link
                    // string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                    // var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);
                    // await UserManager.SendEmailAsync(user.Id, "Confirm your account", "Please confirm your account by clicking <a href=\"" + callbackUrl + "\">here</a>");

                    return RedirectToAction("Index", "Home");
                }
                AddErrors(result);
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ConfirmEmail
        [AllowAnonymous]
        public async Task<ActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return View("Error");
            }
            var result = await UserManager.ConfirmEmailAsync(userId, code);
            return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }

        //
        // GET: /Account/ForgotPassword
        [AllowAnonymous]
        public ActionResult ForgotPassword()
        {
            return View();
        }

        //
        // POST: /Account/ForgotPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByNameAsync(model.Email);
                if (user == null || !(await UserManager.IsEmailConfirmedAsync(user.Id)))
                {
                    // Don't reveal that the user does not exist or is not confirmed
                    return View("ForgotPasswordConfirmation");
                }

                // For more information on how to enable account confirmation and password reset please visit http://go.microsoft.com/fwlink/?LinkID=320771
                // Send an email with this link
                // string code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
                // var callbackUrl = Url.Action("ResetPassword", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);		
                // await UserManager.SendEmailAsync(user.Id, "Reset Password", "Please reset your password by clicking <a href=\"" + callbackUrl + "\">here</a>");
                // return RedirectToAction("ForgotPasswordConfirmation", "Account");
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ForgotPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        //
        // GET: /Account/ResetPassword
        [AllowAnonymous]
        public ActionResult ResetPassword(string code)
        {
            return code == null ? View("Error") : View();
        }

        //
        // POST: /Account/ResetPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var user = await UserManager.FindByNameAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return RedirectToAction("ResetPasswordConfirmation", "Account");
            }
            var result = await UserManager.ResetPasswordAsync(user.Id, model.Code, model.Password);
            if (result.Succeeded)
            {
                return RedirectToAction("ResetPasswordConfirmation", "Account");
            }
            AddErrors(result);
            return View();
        }

        //
        // GET: /Account/ResetPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        //
        // POST: /Account/ExternalLogin
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ExternalLogin(string provider, string returnUrl)
        {
            // Request a redirect to the external login provider
            return new ChallengeResult(provider, Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }));
        }

        //
        // GET: /Account/SendCode
        [AllowAnonymous]
        public async Task<ActionResult> SendCode(string returnUrl, bool rememberMe)
        {
            var userId = await SignInManager.GetVerifiedUserIdAsync();
            if (userId == null)
            {
                return View("Error");
            }
            var userFactors = await UserManager.GetValidTwoFactorProvidersAsync(userId);
            var factorOptions = userFactors.Select(purpose => new SelectListItem { Text = purpose, Value = purpose }).ToList();
            return View(new SendCodeViewModel { Providers = factorOptions, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/SendCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SendCode(SendCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            // Generate the token and send it
            if (!await SignInManager.SendTwoFactorCodeAsync(model.SelectedProvider))
            {
                return View("Error");
            }
            return RedirectToAction("VerifyCode", new { Provider = model.SelectedProvider, ReturnUrl = model.ReturnUrl, RememberMe = model.RememberMe });
        }

        //
        // GET: /Account/ExternalLoginCallback
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl)
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (loginInfo == null)
            {
                return RedirectToAction("Login");
            }

            // Sign in the user with this external login provider if the user already has a login
            var result = await SignInManager.ExternalSignInAsync(loginInfo, isPersistent: false);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = false });
                case SignInStatus.Failure:
                default:
                    // If the user does not have an account, then prompt the user to create an account
                    ViewBag.ReturnUrl = returnUrl;
                    ViewBag.LoginProvider = loginInfo.Login.LoginProvider;
                    return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel { Email = loginInfo.Email });
            }
        }

        //
        // POST: /Account/ExternalLoginConfirmation
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ExternalLoginConfirmation(ExternalLoginConfirmationViewModel model, string returnUrl)
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Manage");
            }

            if (ModelState.IsValid)
            {
                // Get the information about the user from the external login provider
                var info = await AuthenticationManager.GetExternalLoginInfoAsync();
                if (info == null)
                {
                    return View("ExternalLoginFailure");
                }
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
                var result = await UserManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    result = await UserManager.AddLoginAsync(user.Id, info.Login);
                    if (result.Succeeded)
                    {
                        await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);
                        return RedirectToLocal(returnUrl);
                    }
                }
                AddErrors(result);
            }

            ViewBag.ReturnUrl = returnUrl;
            return View(model);
        }

        //
        // POST: /Account/LogOff
        public ActionResult LogOff()
        {
            RemoveLoginCookieAndSession();
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
            
            if(Convert.ToBoolean(ConfigurationManager.AppSettings["EnabledSSO"] != null ? ConfigurationManager.AppSettings["EnabledSSO"] : "false"))
                return Redirect(ConfigurationManager.AppSettings["SSOURL"]);

            return RedirectToAction("Login", "Account");
        }

        private void RemoveLoginCookieAndSession()
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);

            HttpContext.Session["CompanyProfiles"] = "";
            HttpContext.Session["MainProfile"] = null;
            HttpContext.Session["UserName"] = "";
            HttpContext.Session["UserId"] = "";
            HttpContext.Session["LoggedCompanyID"] = null;
            HttpContext.Session["LoginDatetime"] = "";
            HttpContext.Session["IsvesselAgent"] = "";
            HttpContext.Session["IscargoAgent"] = "";

            if (HttpContext.Session != null)
            {
                HttpContext.Session.Clear();
                HttpContext.Session.Abandon();
            }

            if (HttpContext?.Request?.Cookies["MAQTA-LOCAL-TOKEN"] != null)
                HttpContext.Request.Cookies["MAQTA-LOCAL-TOKEN"].Expires = DateTime.Now.AddDays(-2);

            if (HttpContext?.Request?.Cookies["upck"] != null)
                HttpContext.Request.Cookies["upck"].Expires = DateTime.Now.AddDays(-2);

            if (HttpContext?.Response?.Cookies["MAQTA-LOCAL-TOKEN"] != null)
                HttpContext.Response.Cookies["MAQTA-LOCAL-TOKEN"].Expires = DateTime.Now.AddDays(-2);

            if (HttpContext?.Response?.Cookies["upck"] != null)
                HttpContext.Response.Cookies["upck"].Expires = DateTime.Now.AddDays(-2);
        }

        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        public ActionResult LoadView(string path)
        {
            try
            {
                if (!string.IsNullOrEmpty(path))
                {
                    var fileExtension = path.Split('.');
                    if (fileExtension[fileExtension.Length - 1].Equals("html"))
                        return new FilePathResult(path, "text/html");
                    else
                        return View(path);
                }
                // TO DO: Need to return to error page
                return null;
            }
            catch (Exception ex)
            {
                CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
                throw ex;
            }
        }
       
        public ActionResult UserIndex()
        {
            ViewBag.LoginURL = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["MamarBaseUrl"]);
            TempData["ApiURL"] = ConfigurationManager.AppSettings["MamarAppSysPublicApiURL"];
            TempData["MGSurveyApiURL"] = ConfigurationManager.AppSettings["MGSurveyApiURL"];


            return View();
        }
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }

            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }

        internal class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion
    }
}