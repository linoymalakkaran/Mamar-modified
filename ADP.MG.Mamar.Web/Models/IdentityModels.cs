using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Collections.Generic;
using System.Linq;


using ADP.MG.Pcs.Models;
using ADP.MG.Pcs.Common.Business;
using ADP.MG.Pcs.Licensing.Business;

namespace ADP.MG.Mamar.Web.Models
{
    // You can add profile data for the user by adding more properties to your ApplicationUser class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
    public class ApplicationUser : IdentityUser
    {
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            var userName = this.UserName;
            var claims = new List<Claim>();

            UserProfileBusinessLogic UserBL = new UserProfileBusinessLogic();
            CompanyBusinessLogic CompanyBL = new CompanyBusinessLogic();
            CompanyBranchBusinessLogic CompanyBranchBL = new CompanyBranchBusinessLogic();
            CompanyProfileBusinessLogic CompanyProfileBL = new CompanyProfileBusinessLogic();


            var loginUser = UserBL.FindUserProfile(userName);
            if (loginUser != null && loginUser.CompanyBranchID > 0)
            {
                var userCompany = CompanyBL.GetById(loginUser.CompanyBranchID);
                claims.Add(new Claim("Username", loginUser.FullName.ToString()));
                claims.Add(new Claim("UserId", loginUser.id.ToString()));
                claims.Add(new Claim("UserCode", loginUser.UserCode));
                claims.Add(new Claim("CompanyID", loginUser.CompanyBranchID.ToString()));
                claims.Add(new Claim("PartyId", userCompany.UCID != null ? userCompany.UCID.ToString() : ""));

                claims.Add(new Claim("TradeLicenseNumber", string.IsNullOrEmpty(userCompany.TradeLicenseNumber) ? string.Empty : userCompany.TradeLicenseNumber));

                var company_profiles = CompanyBL.GetCompanyProfiles((int?)loginUser.CompanyBranchID)
                    .Select(a => a.CompanyProfileCode).ToList<string>();
                if (company_profiles != null)
                    claims.Add(new Claim("CompanyProfiles", string.Join(",", company_profiles)));
                int? mainprofileID = userCompany.MainProfileID;
                var mainProfile = mainprofileID == null ? null : CompanyProfileBL.GetById(mainprofileID).CompanyProfileCode;
                if (mainProfile != null)
                    claims.Add(new Claim("CompanyMainProfile", mainProfile));
                if (mainProfile == "TOP")
                {
                    var terminal = CompanyBranchBL.GetCompanyBranchTerminal(loginUser.CompanyBranchID);
                    if (terminal != null)
                    {
                        claims.Add(new Claim("TerminalCode", terminal.TerminalCode));
                        claims.Add(new Claim("TerminalID", terminal.TerminalID.ToString()));
                    }
                }

                //if ((mainProfile == "HSE" || mainProfile == "HBM" || mainProfile == "MRS"
                //                || company_profiles.Contains("HSE") || company_profiles.Contains("HBM") || company_profiles.Contains("MRS")) && loginUser.Role != Enums.Roles.SuperAdmin.GetDescription())
                //{
                //    if (new CommonRepository().CheckMarsaStatus())
                //        return null;
                //}
            }

            else
                return null;
            userIdentity.AddClaims(claims);
            // Add custom user claims here
            return userIdentity;
        }
    }

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext()
            : base("PCSDbContext", throwIfV1Schema: false)
        {
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }
    }
}