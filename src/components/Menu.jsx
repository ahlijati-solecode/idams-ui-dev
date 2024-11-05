import React from 'react';
import { Menu as AntdMenu } from 'antd';
import { Icon } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import './Menu.scss';

const Menu = ({
  items,
  selectedKeys,
  onSelect,
}) => (
  <div className="solecode-ui-menu">
    <AntdMenu
      mode="horizontal"
      selectedKeys={selectedKeys}
      onClick={onSelect}
    >
      {
        items.filter((e) => e.visible).map((e) => {
          const { key, label, icon, children } = e;

          if (children?.length) {
            return (
              <AntdMenu.SubMenu
                key={key}
                title={(
                  <>
                    {label}
                    <Icon name="angle-down" />
                  </>
                )}
                icon={icon ? <Icon name={icon} /> : null}
                popupClassName="solecode-ui-menu-submenu"
              >
                {
                  children.filter((ee) => ee.visible).map((ee) => (
                    <AntdMenu.Item
                      key={ee.key}
                      icon={icon ? <Icon name={ee.icon} /> : null}
                    >
                      {ee.label}
                    </AntdMenu.Item>
                  ))
                }
              </AntdMenu.SubMenu>
            );
          }

          return (
            <AntdMenu.Item
              key={key}
              icon={icon ? <Icon name={icon} /> : null}
            >
              {label}
            </AntdMenu.Item>
          );
        })
      }
    </AntdMenu>
  </div>
);

Menu.propTypes = {
  items: PropTypes.array,
  selectedKeys: PropTypes.array,
  onSelect: PropTypes.func,
};

Menu.defaultProps = {
  items: [],
  selectedKeys: [],
  onSelect: () => {},
};

export default Menu;
