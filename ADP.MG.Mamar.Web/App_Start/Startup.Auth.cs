
using ADP.MG.Mamar.Web.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Owin;
using System;
using System.Configuration;
using System.Security.Claims;

namespace ADP.MG.Mamar.Web
{
    public partial class Startup
    {
        // For more information on configuring authentication, please visit http://go.microsoft.com/fwlink/?LinkId=301864
        public void ConfigureAuth(IAppBuilder app)
        {
			// Configure the db context, user manager and signin manager to use a single instance per request
			#region SSO
			app.CreatePerOwinContext(ApplicationDbContext.Create);
            app.CreatePerOwinContext<ApplicationUserManager>(ApplicationUserManager.Create);
            app.CreatePerOwinContext<ApplicationSignInManager>(ApplicationSignInManager.Create);
            #endregion
            // Enable the application to use a cookie to store information for the signed in user
            // and to use a cookie to temporarily store information about a user logging in with a third party login provider
            // Configure the sign in cookie
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Account/Login"),

                #region SSO
                CookieSecure = String.Compare(System.Configuration.ConfigurationManager.AppSettings["Environment"], "PROD", true) != 0 ? CookieSecureOption.SameAsRequest : CookieSecureOption.Always,
                CookieHttpOnly = true,
                CookieName = "mta",
                Provider = new CookieAuthenticationProvider
                {
                    // Enables the application to validate the security stamp when the user logs in.
                    // This is a security feature which is used when you change a password or add an external login to your account.  
                    OnValidateIdentity = async context =>
                    {
                        // invalidate user cookie if user's security stamp have changed
                        var invalidateBySecurityStamp = SecurityStampValidator.OnValidateIdentity<ApplicationUserManager, ApplicationUser>(
                                validateInterval: TimeSpan.FromMinutes(5),
                                regenerateIdentity: (manager, user) => user.GenerateUserIdentityAsync(manager));
                        await invalidateBySecurityStamp.Invoke(context);
                        if (context.Identity == null || !context.Identity.IsAuthenticated)
                        {
                            return;
                        }
                        if ((context.Identity.HasClaim(p => p.Type == "CompanyID")
                            && context.Identity.HasClaim(p => p.Type == "CompanyProfiles")
                            && context.Identity.HasClaim(p => p.Type == "CompanyMainProfile")
                            && context.Identity.HasClaim(p => p.Type == "Username")
                            && context.Identity.HasClaim(p => p.Type == "UserId")) == false)
                        {
                            try
                            {
                                var userManager = context.OwinContext.GetUserManager<ApplicationUserManager>();
                                var username = context.Identity.Name;
                                var updatedUser = await userManager.FindByNameAsync(username);
                                ClaimsIdentity newIdentity = await updatedUser.GenerateUserIdentityAsync(userManager);
                                context.OwinContext.Authentication.SignOut(context.Options.AuthenticationType);
                                var authenticationProperties = new AuthenticationProperties() { IsPersistent = context.Properties.IsPersistent };
                                context.OwinContext.Authentication.SignIn(authenticationProperties, newIdentity);
                            }
                            catch (Exception _ex)
                            {
                                context.OwinContext.Authentication.SignOut(context.Options.AuthenticationType);
                                return;
                            }
                        }
                    }
                }

                #endregion 
            });


            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Enables the application to temporarily store user information when they are verifying the second factor in the two-factor authentication process.
            app.UseTwoFactorSignInCookie(DefaultAuthenticationTypes.TwoFactorCookie, TimeSpan.FromMinutes(5));

            // Enables the application to remember the second login verification factor such as phone or email.
            // Once you check this option, your second step of verification during the login process will be remembered on the device where you logged in from.
            // This is similar to the RememberMe option when you log in.
            app.UseTwoFactorRememberBrowserCookie(DefaultAuthenticationTypes.TwoFactorRememberBrowserCookie);

			// Uncomment the following lines to enable logging in with third party login providers
			//app.UseMicrosoftAccountAuthentication(
			//    clientId: "",
			//    clientSecret: "");

			//app.UseTwitterAuthentication(
			//   consumerKey: "",
			//   consumerSecret: "");

			//app.UseFacebookAuthentication(
			//   appId: "",
			//   appSecret: "");

			//app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions()
			//{
			//    ClientId = "",
			//    ClientSecret = ""
			//});

			string signalRContext = ConfigurationManager.ConnectionStrings["MamarSignalRContext"].ConnectionString;
			GlobalHost.DependencyResolver.UseSqlServer(signalRContext);
			app.MapSignalR();
		}
    }
}