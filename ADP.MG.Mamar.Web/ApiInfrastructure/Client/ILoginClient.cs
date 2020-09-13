namespace ADP.MG.Mamar.Web.ApiInfrastructure.Client
{
    using System.Threading.Tasks;
    using Responses;
 

    public interface ILoginClient
    {
        Task<TokenResponse> Login(string email, string password);
      

    }
}