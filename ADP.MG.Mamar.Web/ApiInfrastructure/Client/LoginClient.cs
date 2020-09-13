namespace ADP.MG.Mamar.Web.ApiInfrastructure.Client
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using ApiHelper.Client;
    using ApiHelper.Response;
    using Responses;
    using System.Web.Mvc;
    using ApiHelper;
    using Models;

    public class LoginClient : ClientBase
    {

        //private const string TokenUri = "/token";
        private const string TokenUri = "api/Token/Create";
        private const string CreateUser = "/Account/CreatePassword";

        public LoginClient(IApiClient apiClient) : base(apiClient)
        {
        }

        public async Task<TokenResponse> Login(string email, string password)
        {
            
            var response = await ApiClient.PostFormContent(TokenUri, "grant_type".AsPair("password"),
                "username".AsPair(email), "password".AsPair(password));
            var tokenResponse = await CreateJsonResponse<TokenResponse>(response);
            if (!response.IsSuccessStatusCode)
            {
                tokenResponse.ResponseResult = "INVALIDUSER";
                return tokenResponse;
            }

            var tokenData = await DecodeContent<dynamic>(response);
            tokenResponse.Data = tokenData;
            return tokenResponse;
        }

        public async Task<ApiResponse> Register(LoginViewModel data)
        {
            ITokenContainer tokenContainer = new TokenContainer();
            ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, tokenContainer);
            GenericClient cb = new GenericClient(client);
            var response = await cb.Post("Account/CreatePassword", data);
            return response;
        }

        public async Task<bool> LogOff()
        {
            ITokenContainer tokenContainer = new TokenContainer();
            ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, tokenContainer);
            GenericClient cb = new GenericClient(client);
            await cb.Post("Account/LogOff", new { });
            return true;
        }

    }
}
