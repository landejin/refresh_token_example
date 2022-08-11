import { createFetch } from '@vueuse/core'
import type { UseFetchOptions, MaybeRef, UseFetchReturn, BeforeFetchContext, AfterFetchContext } from '@vueuse/core'
import { ref, unref, watch } from 'vue'
import { getAccessToken, setAccessToken, removeAccessToken, getRefreshToken, setRefreshToken, removeRefreshToken } from './get'

enum RefreshStatus {
  Success = 1,
  Fail = -1,
  Refreshing = 0
}

const isRefreshing = ref<RefreshStatus>()

const myFetch = createFetch({
  baseUrl: '/api',
  options: {
    beforeFetch(ctx) { // Pass headers before each request
      const headers: HeadersInit = {
        access_token: getAccessToken()
      }
      ctx.options.headers = headers
    
      return ctx
    }
  }
})

const afterFetch = (
  ctx: AfterFetchContext<any>,
  execute: Function,
): Promise<Partial<AfterFetchContext>> | Partial<AfterFetchContext> => {
  let data: Record<string, unknown> = ctx.data
  try {
    data = JSON.parse(ctx.data)
  }
  catch { }

  return new Promise((resolve) => {
    if (data.status === 401) { // The access_token expires, and the request is initiated after re obtaining the access_token
      const stopAfterWatch = watch(isRefreshing, () => {
        if (unref(isRefreshing) === RefreshStatus.Refreshing) { // If refreshing, continue to wait
          return
        }

        if (unref(isRefreshing) === RefreshStatus.Fail) { // Refresh failed, cancel watch
          stopAfterWatch()
          return
        }

        stopAfterWatch() // cancel watch

        // I need to request the failed api again, So either I need get the execute, Or get Requested method&type&payload&payloadType
        return execute() // Reissue request, And return the latest data

        // or
        // const { data, onFetchResponse } = useFetch(url, options).[json()?].[post()?] // I don't know request config
        // ...
      })

      if (unref(isRefreshing) !== RefreshStatus.Refreshing) { // If no refreshing
        isRefreshing.value = RefreshStatus.Refreshing
        refreshToken()
      }
    }
    else {
      resolve(ctx)
    }
  })
}

const refreshToken = () => {
  return myFetch('/refresh').json().post({
    refresh_token: getRefreshToken()
  }).then(({ data }) => {
    const { status } = unref(data)
    const { access_token } = unref(data).data
    if (status === 1 && access_token) {
      setAccessToken(access_token)
      isRefreshing.value = RefreshStatus.Success
    }
    else {
      removeRefreshToken()
      removeAccessToken()
      isRefreshing.value = RefreshStatus.Fail
      alert('refreshToken fail, login again')
    }
  })
}

/**
 * @param {MaybeRef<string>} url
 * @param {RequestInit} [options={}]
 * @param {UseFetchOptions} [useFetchOptions] useFetch请求配置
 * @return {*}  {(UseFetchReturn<any> & PromiseLike<UseFetchReturn<any>>)} 保持vueuse/useFetch中用法一致
 */
export const useFetch = (
  url: MaybeRef<string>,
  options: RequestInit = {},
  useFetchOptions?: UseFetchOptions,
): UseFetchReturn<any> & PromiseLike<UseFetchReturn<any>> => {
  const fetchReturn = myFetch(url, options, Object.assign({
    afterFetch(ctx: AfterFetchContext<any>): Promise<Partial<AfterFetchContext>> | Partial<AfterFetchContext> {
      return afterFetch(ctx, fetchReturn.execute)
    },
  }, useFetchOptions))

  return fetchReturn
}
