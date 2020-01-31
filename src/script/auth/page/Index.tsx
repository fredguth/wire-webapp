/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {UrlUtil} from '@wireapp/commons';
import {Button, COLOR, ContainerXS, ErrorMessage, Logo, Text} from '@wireapp/react-ui-kit';
import React, {useEffect, useState} from 'react';
import {FormattedHTMLMessage, useIntl} from 'react-intl';
import useReactRouter from 'use-react-router';
import {Config} from '../../Config';
import {indexStrings, logoutReasonStrings} from '../../strings';
import {QUERY_KEY, ROUTE} from '../route';
import Page from './Page';

interface Props extends React.HTMLProps<HTMLDivElement> {}

const Index = ({}: Props) => {
  const {formatMessage: _} = useIntl();
  const {history} = useReactRouter();
  const [logoutReason, setLogoutReason] = useState();

  useEffect(() => {
    const queryLogoutReason = UrlUtil.getURLParameter(QUERY_KEY.LOGOUT_REASON) || null;
    if (queryLogoutReason) {
      setLogoutReason(queryLogoutReason);
    }
  }, []);
  return (
    <Page>
      <ContainerXS centerText verticalCenter style={{width: '380px'}}>
        <Logo scale={1.68} style={{marginBottom: '80px'}} data-uie-name="ui-wire-logo" />
        <Text block center style={{fontSize: '32px', fontWeight: 300, marginBottom: '48px'}}>
          {_(indexStrings.welcome, {brandName: Config.getConfig().BRAND_NAME})}
        </Text>
        {Config.getConfig().FEATURE.ENABLE_ACCOUNT_REGISTRATION ? (
          <>
            <Button
              onClick={() => history.push(ROUTE.SET_ACCOUNT_TYPE)}
              block
              style={{fontSize: '13px'}}
              data-uie-name="go-set-account-type"
            >
              {_(indexStrings.createAccount)}
            </Button>
            <Button
              onClick={() => history.push(ROUTE.LOGIN)}
              block
              backgroundColor={'transparent'}
              color={COLOR.BLUE}
              style={{border: `1px solid ${COLOR.BLUE}`, fontSize: '13px'}}
              data-uie-name="go-login"
            >
              {_(indexStrings.logIn)}
            </Button>
            {logoutReason && (
              <ErrorMessage center data-uie-name="status-logout-reason">
                <FormattedHTMLMessage {...logoutReasonStrings[logoutReason]} />
              </ErrorMessage>
            )}
            <Button
              onClick={() => history.push(ROUTE.SSO)}
              block
              color={COLOR.TEXT}
              backgroundColor={COLOR.GRAY_LIGHTEN_64}
              style={{fontSize: '13px', marginTop: '120px'}}
              data-uie-name="go-sso-login"
            >
              {_(Config.getConfig().FEATURE.ENABLE_DOMAIN_DISCOVERY ? indexStrings.enterprise : indexStrings.ssoLogin)}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => history.push(ROUTE.LOGIN)} block style={{fontSize: '13px'}} data-uie-name="go-login">
              {_(indexStrings.logIn)}
            </Button>
            <Button
              onClick={() => history.push(ROUTE.SSO)}
              block
              backgroundColor={'transparent'}
              color={COLOR.BLUE}
              style={{border: `1px solid ${COLOR.BLUE}`, fontSize: '13px'}}
              data-uie-name="go-sso-login"
            >
              {_(Config.getConfig().FEATURE.ENABLE_DOMAIN_DISCOVERY ? indexStrings.enterprise : indexStrings.ssoLogin)}
            </Button>
            {logoutReason && (
              <ErrorMessage center data-uie-name="status-logout-reason">
                <FormattedHTMLMessage {...logoutReasonStrings[logoutReason]} />
              </ErrorMessage>
            )}
          </>
        )}
      </ContainerXS>
    </Page>
  );
};

export default Index;
