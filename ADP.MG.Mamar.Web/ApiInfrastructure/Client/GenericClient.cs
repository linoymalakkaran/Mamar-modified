using ApiHelper;

namespace ADP.MG.Mamar.Web.ApiInfrastructure.Client
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using ApiHelper.Client;
    using ApiHelper.Response;
    using Responses;
    using System;
    using System.Collections.Specialized;

    public class GenericClient : ClientBase
    {
       
        public GenericClient(IApiClient apiClient) : base(apiClient)
        {
            
        }


        public async Task<ApiResponse> Get(string uri)
        {
            var response = await ApiClient.GetContent(uri);
            var getResponse = await CreateJsonResponse<ApiResponse>(response);
            return getResponse;
        }

        public async Task<ApiResponse> Post(string uri, dynamic data)
        {
            try
            {
                dynamic response;
                if (data != null)
                    response = await ApiClient.PostJsonEncodedContent(uri, data);
                else
                    response = await ApiClient.PostFormEncodedContent(uri);

                var getResponse = await CreateJsonResponse<ApiResponse>(response);
                return getResponse;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// OverLoad Method Added for Mamar Project - For Postpaid/Prepaid user account
        /// </summary>
        /// <param name="uri"></param>
        /// <param name="customHeaderKey"></param>
        /// <param name="customHeaderValue"></param>
        /// <returns></returns>
        public async Task<ApiResponse> Get(string uri, Dictionary<string,string> customHeadersList)
        {
            var response = await ApiClient.GetContent(uri, customHeadersList);
            var getResponse = await CreateJsonResponse<ApiResponse>(response);
            return getResponse;
        }

        /// <summary>
        /// OverLoad Method Added for Mamar Project - For Postpaid/Prepaid user account
        /// </summary>
        /// <param name="uri"></param>
        /// <param name="data"></param>
        /// <param name="customHeaderKey"></param>
        /// <param name="customHeaderValue"></param>
        /// <returns></returns>
        public async Task<ApiResponse> Post(string uri, dynamic data, Dictionary<string, string> customHeadersList)
        {
            try
            {
                dynamic response;
                if (data != null)
                    response = await ApiClient.PostJsonEncodedContent(uri, data, customHeadersList);
                else
                    response = await ApiClient.PostFormEncodedContent(uri, customHeadersList);

                var getResponse = await CreateJsonResponse<ApiResponse>(response);
                return getResponse;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public void LogErrorinMgApp(string errorMessage)
        {
            try
            {
                ApiClient.PostJsonEncodedContent("Appointment/LogError", errorMessage);
            }
            catch { }
        }


    }
}