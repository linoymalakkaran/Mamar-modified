namespace ADP.MG.Mamar.Web.ApiInfrastructure
{
    using System.Web;
    using System;
    using ApiHelper;

    public class TokenContainer : ITokenContainer
    {
        private const string ApiTokenKey = "ApiToken";
        private const string ApiTokenExpiryKey = "ApiTokenExpiry";
        private readonly string UserName = null;

        public TokenContainer()
        {

        }
        public TokenContainer(string userName)
        {
            UserName = userName;
        }

        public object ApiToken
        {
            get
            {
                ADP.MG.Appointment.Business.TokenManager tokenManager = new Appointment.Business.TokenManager();
                var validToken = false;
                var token = tokenManager.GetToken(Current.User.Identity.Name);
                if (token != null)
                    validToken = DateTime.Now <= token.Expiry.AddDays(-1);
                if (validToken)
                {
                    return token.Token;
                }
                else
                    return null;


            }
            set
            {
                ADP.MG.Appointment.Business.TokenManager tokenManager = new Appointment.Business.TokenManager();
                tokenManager.StoreToken(new ADP.MG.Appointment.Business.UserToken { UserName = UserName, Expiry = DateTime.Now.AddDays(14), Token = value.ToString() });
            }
        }

        private static HttpContextBase Current
        {
            get { return new HttpContextWrapper(HttpContext.Current); }
        }

        public object ApiTokenExpiry
        {
            get
            {
                return Current.Session != null ? Current.Session[ApiTokenExpiryKey] : null;
            }
        }

        public string ApiSelectedCompany
        {
            get; set;
        }
    }
}